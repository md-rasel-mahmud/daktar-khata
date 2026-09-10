import ProvidersWrapper from "@/providers/ProvidersWrapper"
import { Toaster } from "sonner"

const App = () => {
  return (
    <>
      <ProvidersWrapper>
        <Toaster richColors position="top-center" />
      </ProvidersWrapper>
    </>
  )
}

export default App
