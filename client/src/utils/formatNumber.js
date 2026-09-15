const formatNumber = (value) => {
  const number = Number(value)

  return new Intl.NumberFormat("en").format(
    Number.isFinite(number) ? number : 0
  )
}

export default formatNumber