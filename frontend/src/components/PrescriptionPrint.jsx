import React from 'react';

const PrescriptionPrint = ({ prescription, doctor, patient, onClose }) => {
  const handlePrint = () => window.print();

  const today = prescription?.created_at
    ? new Date(prescription.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #rx-print-area, #rx-print-area * { visibility: visible !important; }
          #rx-print-area { position: fixed; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Overlay */}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'white', borderRadius: '20px', maxWidth: '720px', width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>

          {/* Action Buttons */}
          <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
            <button onClick={handlePrint} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' }}>🖨️ Print</button>
            <button onClick={onClose} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>✕ Close</button>
          </div>

          {/* Prescription Template */}
          <div id="rx-print-area" style={{ padding: '35px 40px', fontFamily: 'Georgia, serif' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #2563eb', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Prescription</div>
                <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#1e293b', fontWeight: '900' }}>Dr. {doctor?.full_name || 'Doctor Name'}</h2>
                <div style={{ color: '#2563eb', fontWeight: '600', fontSize: '0.95rem', marginTop: '4px' }}>{doctor?.specialization || 'Specialist'}</div>
                <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>Reg. No: {doctor?.registration_no || 'MCI-XXXXXX'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ background: '#eff6ff', padding: '10px 18px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Date</div>
                  <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{today}</div>
                </div>
              </div>
            </div>

            {/* Patient Info */}
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px 20px', marginBottom: '25px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Patient Name</div>
                <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{patient?.name || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Age / Gender</div>
                <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{patient?.age || '—'} yrs / {patient?.gender === 'M' ? 'Male' : patient?.gender === 'F' ? 'Female' : 'Other'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Aadhaar / ID</div>
                <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{patient?.aadhaar || '—'}</div>
              </div>
              {patient?.blood_group && <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Blood Group</div>
                <div style={{ fontWeight: 'bold', color: '#dc2626' }}>🩸 {patient.blood_group}</div>
              </div>}
              {patient?.allergies && <div style={{ gridColumn: '2/-1' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Known Allergies</div>
                <div style={{ fontWeight: 'bold', color: '#dc2626' }}>⚠️ {patient.allergies}</div>
              </div>}
            </div>

            {/* Diagnosis */}
            {prescription?.diagnosis && (
              <div style={{ marginBottom: '25px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Diagnosis</div>
                <div style={{ background: '#eff6ff', padding: '12px 18px', borderRadius: '10px', color: '#1e40af', fontWeight: '700', fontSize: '1.05rem' }}>
                  {prescription.diagnosis}
                </div>
              </div>
            )}

            {/* Rx Symbol + Medicines */}
            <div style={{ marginBottom: '25px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ background: '#2563eb', color: 'white', fontWeight: '900', fontSize: '1.4rem', padding: '4px 14px', borderRadius: '8px', fontStyle: 'italic' }}>Rx</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Medicines Prescribed</div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#1e293b', color: 'white' }}>
                    {['#', 'Medicine', 'Dosage', 'Frequency', 'Duration', 'Instructions'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(prescription?.items || []).map((item, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#f8fafc' : 'white', borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '11px 12px', fontWeight: 'bold', color: '#2563eb' }}>{i + 1}</td>
                      <td style={{ padding: '11px 12px', fontWeight: '700', color: '#1e293b' }}>{item.medicine_name}</td>
                      <td style={{ padding: '11px 12px', color: '#475569' }}>{item.dosage}</td>
                      <td style={{ padding: '11px 12px', color: '#475569' }}>{item.frequency_display || item.frequency}</td>
                      <td style={{ padding: '11px 12px', color: '#475569' }}>{item.duration || '—'}</td>
                      <td style={{ padding: '11px 12px', color: '#64748b', fontSize: '0.85rem' }}>{item.instructions || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Doctor Notes */}
            {prescription?.notes && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px 18px', marginBottom: '30px' }}>
                <div style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 'bold', marginBottom: '5px' }}>📝 DOCTOR'S NOTES</div>
                <div style={{ color: '#78350f', lineHeight: '1.6' }}>{prescription.notes}</div>
              </div>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid #e2e8f0', paddingTop: '20px', marginTop: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.6' }}>
                <div>⚠️ This prescription is valid for 30 days from the date of issue.</div>
                <div>Take medicines as directed. Do not self-medicate.</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '180px', borderTop: '2px solid #1e293b', paddingTop: '8px' }}>
                  <div style={{ fontWeight: 'bold', color: '#1e293b' }}>Dr. {doctor?.full_name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Signature & Stamp</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrescriptionPrint;
