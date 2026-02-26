import { skills } from '../content'

export default function Skills() {
  return (
    <div className="skills-grid">
      <div className="skill-column strong">
        <h3>Strong</h3>
        {skills.strong.map((s) => (
          <div key={s} className="skill-item">{s}</div>
        ))}
      </div>
      <div className="skill-column moderate">
        <h3>Developing</h3>
        {skills.moderate.map((s) => (
          <div key={s} className="skill-item">{s}</div>
        ))}
      </div>
      <div className="skill-column gaps">
        <h3>Not my strength</h3>
        {skills.gaps.map((s) => (
          <div key={s} className="skill-item">{s}</div>
        ))}
      </div>
    </div>
  )
}
