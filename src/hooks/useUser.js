import userStore from "@stores/UserStore"

function useUser() {
  const {
    user
  } = userStore()
  
  return {
    user
  }
}

export default useUser