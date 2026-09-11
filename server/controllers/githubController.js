const contributionsController = (req,res) => {
  let { username } = req.body

  username = username?.trim()

  if(!username){
   return res.status(400).json({
      error : "Username is required"
    })
  }

  return res.status(200).json({
    username
  })
}

export {contributionsController}

