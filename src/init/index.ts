import { ensureSubscriptionPlans } from "./initPlans"

export const initDbStaticEntities = async () => {
  await ensureSubscriptionPlans();
}