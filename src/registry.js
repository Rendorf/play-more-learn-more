// Skill and unit registry. Grade files call these at load time (see CONTRACT.md).
const PMLM = {
  units: [],
  skills: [],
  byId: {},
  unitById: {},
  registerUnit(u) {
    if (this.unitById[u.id]) return;
    this.units.push(u);
    this.unitById[u.id] = u;
  },
  registerSkill(s) {
    if (this.byId[s.id]) return;
    this.skills.push(s);
    this.byId[s.id] = s;
  },
  unitsOf(grade) { return this.units.filter(u => u.grade === grade); },
  skillsOf(grade) { return this.skills.filter(s => s.grade === grade); },
  skillsInUnit(unitId) { return this.skills.filter(s => s.unit === unitId); },
};
