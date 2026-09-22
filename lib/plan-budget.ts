export type BudgetLine = {
  type: string;
  costCLP: number;
  slug?: string;
  name: string;
  note: string;
  pass?: unknown;
};

export type BudgetDay = {
  day: number;
  title: string;
  items: BudgetLine[];
};

export type BudgetPlan = {
  budgetCLP: number;
  nights: number;
  guests: number;
  days: BudgetDay[];
  totals: {
    stay: number;
    food: number;
    activities: number;
    tickets?: number;
    total: number;
    remaining: number;
  };
};

const DROP_FIRST = ["ticket", "activity", "food", "stay", "place"] as const;

export function recomputePlan<T extends BudgetPlan>(plan: T): T {
  const days = plan.days
    .map((day) => ({
      ...day,
      items: day.items.filter((item) => Number.isFinite(Number(item.costCLP))),
    }))
    .filter((day) => day.items.length > 0);
  let stay = 0;
  let food = 0;
  let activities = 0;
  let tickets = 0;
  let stayNights = 0;
  for (const day of days) {
    for (const item of day.items) {
      const cost = Math.max(0, Math.round(Number(item.costCLP) || 0));
      item.costCLP = cost;
      if (item.type === "stay") {
        stay += cost;
        stayNights += 1;
      } else if (item.type === "food") food += cost;
      else if (item.type === "activity") activities += cost;
      else if (item.type === "ticket") tickets += cost;
    }
  }
  const total = stay + food + activities + tickets;
  return {
    ...plan,
    nights: stayNights,
    days,
    totals: {
      stay,
      food,
      activities,
      tickets,
      total,
      remaining: Math.round(plan.budgetCLP) - total,
    },
  };
}

function withoutIndex<T extends BudgetPlan>(plan: T, dayIndex: number, itemIndex: number): T {
  return {
    ...plan,
    days: plan.days.map((day, d) =>
      d === dayIndex
        ? { ...day, items: day.items.filter((_, i) => i !== itemIndex) }
        : day,
    ),
  };
}

export function dropPlanItem<T extends BudgetPlan>(
  plan: T,
  dayIndex: number,
  itemIndex: number,
): T {
  return recomputePlan(withoutIndex(plan, dayIndex, itemIndex));
}

export function dropPlanTypes<T extends BudgetPlan>(plan: T, types: string[]): T {
  const skip = new Set(types);
  return recomputePlan({
    ...plan,
    days: plan.days.map((day) => ({
      ...day,
      items: day.items.filter((item) => !skip.has(item.type)),
    })),
  });
}

/** Drops paid lines, cheapest to protect last, until the quote fits the budget. */
export function trimToBudget<T extends BudgetPlan>(plan: T): T {
  let next = recomputePlan(plan);
  let guard = 0;
  while (next.totals.total > next.budgetCLP && guard < 80) {
    guard += 1;
    let removed = false;
    for (const type of DROP_FIRST) {
      let dayIndex = -1;
      let itemIndex = -1;
      next.days.forEach((day, d) => {
        day.items.forEach((item, i) => {
          if (item.type === type && item.costCLP > 0) {
            dayIndex = d;
            itemIndex = i;
          }
        });
      });
      if (dayIndex >= 0) {
        next = recomputePlan(withoutIndex(next, dayIndex, itemIndex));
        removed = true;
        break;
      }
    }
    if (!removed) break;
  }
  return next;
}
