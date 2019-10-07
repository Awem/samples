import { UserInputError } from 'apollo-server-errors'
import bcrypt from 'bcryptjs'
import { sign } from 'jsonwebtoken'

export const login = async (obj, { email, password }, { prisma }) => {
  const user = await prisma.user({ email })

  if (!user) {
    throw new UserInputError('No user with that email')
  }

  const valid = await bcrypt.compare(password, user.password)

  if (!valid) {
    throw new UserInputError('Incorrect password')
  }

  const token = sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  )

  return {
    token,
    user
  }
}
