const { User, subscription: Subscription } = require('../models');
const { Op } = require('sequelize');

/**
 * Reconciles each user's denormalised `subscription_status` flag against the
 * truth source (their subscription rows + expiry_date). Run on a schedule so
 * expired-but-untouched users no longer appear active in admin dashboards or
 * client gates that read this flag without re-checking expiry_date.
 *
 * Note: we deliberately do NOT mutate Subscription.status here — that column's
 * enum is (pending|completed|failed|refunded) and represents the payment
 * outcome, not the access window. expiry_date is the source of truth for
 * whether access is currently granted.
 *
 * Idempotent — safe to run repeatedly.
 */
async function reconcileSubscriptionStatuses() {
  const now = new Date();

  // Find users whose flag says active/expired but doesn't match reality.
  const candidates = await User.findAll({
    where: {
      subscription_status: { [Op.in]: ['active', 'expired'] },
    },
    attributes: ['uuid', 'subscription_status'],
  });

  let activated = 0;
  let expired = 0;

  for (const user of candidates) {
    const stillActive = await Subscription.count({
      where: {
        user_id: user.uuid,
        status: 'completed',
        [Op.or]: [
          { expiry_date: null },
          { expiry_date: { [Op.gt]: now } },
        ],
      },
    });

    const target = stillActive > 0 ? 'active' : 'expired';
    if (user.subscription_status !== target) {
      await User.update(
        { subscription_status: target },
        { where: { uuid: user.uuid } }
      );
      if (target === 'active') activated++;
      else expired++;
    }
  }

  return { activated, expired, scanned: candidates.length };
}

module.exports = { reconcileSubscriptionStatuses };
