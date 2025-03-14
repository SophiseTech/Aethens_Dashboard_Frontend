const handleInternalError = (error) => {
  console.error("Error occured : ", error?.message || error, error?.stack)
}

export default handleInternalError