import IdentificationFlowInput from "../components/identification-flow-input/identification-flow-input";
import { IDENTIFICATION_FLOW_LABELS } from "../mock/identification-flow";

export default function IdentificationFlowEntry() {
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2>Coloca tus datos</h2>
      <IdentificationFlowInput labels={IDENTIFICATION_FLOW_LABELS} />
    </div>
  );
}
