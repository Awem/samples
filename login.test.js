import {
  clearTestPrisma,
  clientQuery,
  createTestUser,
  startTestServer
} from '../../../../lib/testHelpers'
import { bindPrisma } from '../../../../lib/graphQLHelper'
import gql from 'graphql-tag'
import { verify } from 'jsonwebtoken'

describe('Login mutation', () => {
  let testServer
  let testQuery
  let testPrisma

  beforeAll(async () => {
    testServer = startTestServer()

    testQuery = clientQuery()

    testPrisma = bindPrisma('masterDataTest')
    await clearTestPrisma(testPrisma)
  })

  afterEach(async () => {
    await clearTestPrisma(testPrisma)
  })

  afterAll(() => {
    testServer.close()
  })

  it('retrieves a jwt for valid users', async () => {
    const login = gql`
        mutation LoginUser($email: String!, $password: String!){
            login(email: $email, password: $password) {
                user {
                    id
                }
                token
            }
        }
    `

    const wrongMail = { email: 'x@z.com', password: 'pw' }
    try {
      await testQuery(login, wrongMail)
    } catch ({ message }) {
      expect(message).toBe('GraphQL error: No user with that email')
    }

    const { id } = await createTestUser(testPrisma, { email: 'a@b.com', password: 'pw' })
    const wrongPass = { email: 'a@b.com', password: 'pw2' }
    try {
      await testQuery(login, wrongPass)
    } catch ({ message }) {
      expect(message).toBe('GraphQL error: Incorrect password')
    }

    const correctParams = { email: 'a@b.com', password: 'pw' }
    const { data } = await testQuery(login, correctParams)
    const { user, token } = data.login
    const validToday = verify(token, process.env.JWT_SECRET)
    expect(validToday).toHaveProperty('id', id)
    expect(user.id).toEqual(id)

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const validTomorrow = () => verify(token, process.env.JWT_SECRET, { clockTimestamp: tomorrow.getTime() })
    expect(validTomorrow).toThrow('jwt expired')
  })
})
