import { useWalletStore } from "../store/useWalletStore"

describe("Wallet Store", () => {
  it("should initialize with null address", () => {
    const state = useWalletStore.getState()
    expect(state.address).toBeNull()
    expect(state.isConnecting).toBeFalsy()
  })

  it("should disconnect correctly", () => {
    useWalletStore.setState({ address: "G...TEST", balance: "100" })
    const state = useWalletStore.getState()
    expect(state.address).toBe("G...TEST")
    
    state.disconnect()
    
    const newState = useWalletStore.getState()
    expect(newState.address).toBeNull()
    expect(newState.balance).toBeNull()
  })
})
