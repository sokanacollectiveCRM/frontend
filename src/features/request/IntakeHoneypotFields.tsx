import {
  INTAKE_HONEYPOT_FIELDS,
  intakeHoneypotValues,
  type IntakeHoneypotField,
} from './intakeAbuse';

/** Hidden fields matching backend honeypot names. Bots that fill them get a fake 200. */
export function IntakeHoneypotFields() {
  return (
    <div
      aria-hidden='true'
      style={{
        position: 'absolute',
        left: '-10000px',
        width: 1,
        height: 1,
        overflow: 'hidden',
      }}
    >
      {INTAKE_HONEYPOT_FIELDS.map((name: IntakeHoneypotField) => (
        <label key={name}>
          {name}
          <input
            type='text'
            name={name}
            tabIndex={-1}
            autoComplete='off'
            defaultValue=''
            onChange={(event) => {
              intakeHoneypotValues[name] = event.target.value;
            }}
          />
        </label>
      ))}
    </div>
  );
}
