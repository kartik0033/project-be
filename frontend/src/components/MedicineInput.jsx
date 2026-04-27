import React, { useState } from 'react';

const COMMON_MEDICINES = [
  'Paracetamol 500mg','Paracetamol 650mg','Ibuprofen 400mg','Aspirin 75mg',
  'Amoxicillin 500mg','Amoxicillin 250mg','Azithromycin 500mg','Azithromycin 250mg',
  'Cetirizine 10mg','Levocetirizine 5mg','Loratadine 10mg','Fexofenadine 120mg',
  'Omeprazole 20mg','Pantoprazole 40mg','Ranitidine 150mg','Domperidone 10mg',
  'Metformin 500mg','Metformin 1000mg','Glimepiride 1mg','Glimepiride 2mg',
  'Amlodipine 5mg','Amlodipine 10mg','Atenolol 50mg','Atorvastatin 10mg','Atorvastatin 20mg',
  'Cefixime 200mg','Ciprofloxacin 500mg','Doxycycline 100mg','Metronidazole 400mg',
  'Prednisolone 5mg','Prednisolone 10mg','Dexamethasone 0.5mg',
  'Vitamin D3 60000 IU','Vitamin B12 1500mcg','Calcium + D3','Iron + Folic Acid',
  'Ondansetron 4mg','Ranitidine 150mg','Montelukast 10mg','Salbutamol 2mg',
  'Diclofenac 50mg','Tramadol 50mg','Pregabalin 75mg',
];

const MedicineInput = ({ value, onChange, placeholder }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [show, setShow] = useState(false);

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);
    if (val.length > 1) {
      const filtered = COMMON_MEDICINES.filter(m => m.toLowerCase().includes(val.toLowerCase())).slice(0, 6);
      setSuggestions(filtered);
      setShow(filtered.length > 0);
    } else {
      setShow(false);
    }
  };

  const select = (med) => { onChange(med); setShow(false); };

  return (
    <div style={{ position: 'relative' }}>
      <input
        value={value}
        onChange={handleChange}
        onBlur={() => setTimeout(() => setShow(false), 150)}
        placeholder={placeholder || 'Type medicine name...'}
        style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
        required
      />
      {show && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', zIndex: 999, overflow: 'hidden' }}>
          {suggestions.map((s, i) => (
            <div key={i} onMouseDown={() => select(s)} style={{ padding: '10px 14px', cursor: 'pointer', fontSize: '0.9rem', color: '#1e293b', borderBottom: '1px solid #f1f5f9' }}
              onMouseOver={e => e.currentTarget.style.background = '#eff6ff'}
              onMouseOut={e => e.currentTarget.style.background = 'white'}>
              💊 {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicineInput;
