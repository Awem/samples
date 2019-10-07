import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button, Form, Message } from 'semantic-ui-react'
import { isEmail, isEmpty } from 'validator'

export class LoginForm extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    serverError: PropTypes.string,
    submitAction: PropTypes.func.isRequired
  }

  state = { email: '', password: '' }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleSubmit = () => {
    const { email, password } = this.state
    const { submitAction } = this.props

    submitAction({ email, password })
  }

  render () {
    const { handleChange, handleSubmit } = this
    const { email, password } = this.state
    const { loading, serverError } = this.props
    const emailError = !isEmail(email)
    const passwordError = isEmpty(password)
    const submitDisabled = emailError || passwordError || !!loading
    return (
      <Form error={!!serverError} loading={loading} onSubmit={handleSubmit}>
        <Form.Input placeholder="Email" name="email" type="email" value={email} onChange={handleChange} error={emailError} />
        <Form.Input placeholder="Password" name="password" type="password" value={password} onChange={handleChange} error={passwordError} />
        {serverError && <Message content={serverError} error header="Server Error" />}
        <Button type="submit" disabled={submitDisabled}>Submit</Button>
      </Form>
    )
  }
}
