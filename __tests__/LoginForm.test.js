import React from 'react'
import { LoginForm } from '../LoginForm'
import { shallow } from 'enzyme'
import { fillInputs } from '../../../helpers/testHelpers'

const mockSubmit = jest.fn()
const standardProps = {
  submitAction: mockSubmit
}

it('renders a signup form', () => {
  const wrapper = shallow(<LoginForm {...standardProps} />)
  expect(wrapper).toMatchSnapshot()
})

it('renders server errors', () => {
  const wrapper = shallow(<LoginForm {...{ ...standardProps, serverError: 'Error' }} />)
  expect(wrapper).toMatchSnapshot()
})

it('renders loading indicator', () => {
  const wrapper = shallow(<LoginForm {...{ ...standardProps, loading: true }} />)
  expect(wrapper).toMatchSnapshot()
})

it('enables submit on valid forms', () => {
  const wrapper = shallow(<LoginForm {...standardProps} />)
  const submitButton = () => wrapper.find('Button')
  const inputs = () => wrapper.find('FormInput')
  const invalidInputValues = {
    email: 'testEmail',
    password: ''
  }
  const validInputValues = {
    email: 'testEmail@test.mail',
    password: 'testPassword'
  }

  expect(submitButton().prop('disabled')).toBe(true)
  expect(mockSubmit).not.toHaveBeenCalled()

  fillInputs(inputs(), invalidInputValues)
  expect(wrapper.state()).toEqual(invalidInputValues)
  expect(wrapper).toMatchSnapshot()
  expect(submitButton().prop('disabled')).toBe(true)

  fillInputs(inputs(), validInputValues)
  expect(wrapper.state()).toEqual(validInputValues)
  expect(submitButton().prop('disabled')).toBe(false)

  wrapper.simulate('submit')
  expect(mockSubmit).toHaveBeenCalledTimes(1)
  expect(mockSubmit).toHaveBeenCalledWith(validInputValues)
})
