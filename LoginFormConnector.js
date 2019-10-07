import React from 'react'
import { useRouter } from 'next/router'
import { useSession } from '../../lib/session'
import { LoginForm } from './LoginForm'

export function LoginFormConnector () {
  const router = useRouter()
  const { signIn, sessionExpired } = useSession()

  const { ref } = router.query
  if (ref === 'loggedOut') {
    sessionExpired()
  }

  const [loginUser, { loading, error }] = signIn
  const submitAction = variables => loginUser({ variables })

  const loginFormProps = {
    submitAction,
    loading,
    ...(error && { serverError: error.message })
  }

  return <LoginForm {...loginFormProps} />
}
