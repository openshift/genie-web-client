import { stateManager } from '../../components/utils/aiStateManager';
import { AIStateProvider } from './types';

// Sample content in case we need to store information in a custom context

// type AIContextType = {
//   sampleValue: string;
//   setSampleValue: (value: string) => void;
// };

// const getSampleValue = () => {
//   const { sampleValue } = useContext(AI);
//   return sampleValue;
// };

// const setSampleValue = (value: string) => {
//   const { setSampleValue } = useContext(AI);
//   setSampleValue(value);
// };

// const AI = createContext<AIContextType | undefined>(undefined);

export const AIProvider = ({ children }: { children: React.ReactNode }) => {
  // const [sampleValue, setSampleValue] = useState('');

  return (
    <AIStateProvider stateManager={stateManager}>
      {/* <AI.Provider value={{ sampleValue, setSampleValue }}> */}
      {children}
      {/* </AI.Provider> */}
    </AIStateProvider>
  );
};
