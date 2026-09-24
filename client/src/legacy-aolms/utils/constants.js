export const STAFF_CATEGORIES = {
  TECHNICIAN: 'Tec/helper/assistant/Driver',
  MANAGEMENT: 'Managemnet / sales team/ Project coordinator',
  CONTROLLER: 'controller',
  SUPERVISOR: 'supervisor',
};

export const STAFF_STATUS = {
  ACTIVE: 'Active employee',
  ON_LEAVE: 'On leave in pakistan',
  WILL_RELEASE: 'Will release',
};

export const CATEGORY_LABELS = {
  [STAFF_CATEGORIES.TECHNICIAN]: 'Technician / Driver',
  [STAFF_CATEGORIES.MANAGEMENT]: 'Management / Sales',
  [STAFF_CATEGORIES.CONTROLLER]: 'Controller',
  [STAFF_CATEGORIES.SUPERVISOR]: 'Supervisor',
};

export const CATEGORY_COLORS = {
  [STAFF_CATEGORIES.TECHNICIAN]: { bg: 'bg-electric/10', text: 'text-electric-light', border: 'border-electric/30' },
  [STAFF_CATEGORIES.MANAGEMENT]: { bg: 'bg-purple/10', text: 'text-purple-light', border: 'border-purple/30' },
  [STAFF_CATEGORIES.CONTROLLER]: { bg: 'bg-cyan/10', text: 'text-cyan-light', border: 'border-cyan/30' },
  [STAFF_CATEGORIES.SUPERVISOR]: { bg: 'bg-amber/10', text: 'text-amber-light', border: 'border-amber/30' },
};

export const STATUS_COLORS = {
  [STAFF_STATUS.ACTIVE]: { bg: 'bg-emerald/10', text: 'text-emerald-light', dot: 'status-dot-active' },
  [STAFF_STATUS.ON_LEAVE]: { bg: 'bg-amber/10', text: 'text-amber-light', dot: 'status-dot-warning' },
  [STAFF_STATUS.WILL_RELEASE]: { bg: 'bg-rose/10', text: 'text-rose-light', dot: 'status-dot-danger' },
};
