import { useState } from 'react';
import FlowSelect from '../components/flow-select/flow-select';
import { BENEFITS_OPTIONS, type BenefitsOption } from '../mock/benefits';

export default function BenefitOptions() {
    const [value, setValue] = useState<BenefitsOption>(BENEFITS_OPTIONS[0] ?? 'Cashback');

    return (
        <div className="w-full max-w-md mx-auto p-6">
            <h2>Escoge tu beneficio</h2>
            <FlowSelect
                ariaLabel="Opciones de beneficios"
                options={[...BENEFITS_OPTIONS]}
                value={value}
                onChange={(next) => {
                    const v = next as BenefitsOption;
                    setValue(v);

                    window.parent?.postMessage(
                      { type: "benefits_selected", value: v },
                      "*"
                    );

                    console.log("value sent");
                }}
            />
        </div>
    );
}

