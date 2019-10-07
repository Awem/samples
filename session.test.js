import { call, put } from 'redux-saga/effects'
import { cloneableGenerator } from '@redux-saga/testing-utils'
import {
  actionCreators, LOGIN_SUCCEEDED, loginUser, LOGOUT_REQUESTED, logoutUser,
  NEW_SESSION, readStorage, reducer, SESSION_FROM_QUERY, SESSION_FROM_STORAGE, storeData
} from '../SessionModule'
import { deleteLoginData, readLoginData, storeLoginData } from '../../../helpers'

const mockErrorHandler = jest.fn()
jest.mock('../../../lib/errorHandler', () => ({
  errorHandler: jest.fn((...args) => mockErrorHandler(...args))
}))

window.wsLogout = () => {}

describe('sessionReducer sync actions', () => {
  it('should create an action when a logout is requested', () => {
    const expectedAction = {
      type: LOGOUT_REQUESTED
    }
    expect(actionCreators.logoutRequested()).toEqual(expectedAction)
  })

  it('should create an action when a session from query is requested', () => {
    const expectedAction = {
      type: SESSION_FROM_QUERY,
      credentials: 'credentials'
    }
    expect(actionCreators.sessionFromQuery('credentials')).toEqual(expectedAction)
  })

  it('should create an action when a session from storage is requested', () => {
    const expectedAction = {
      type: SESSION_FROM_STORAGE
    }
    expect(actionCreators.sessionFromStorage()).toEqual(expectedAction)
  })
})

describe('sessionReducer sagas', () => {
  describe('#loginUser', () => {
    const credentials = { id: 'x', token: 'token' }
    const saga = cloneableGenerator(loginUser)({ credentials })
    let failure

    it('should dispatch type: NEW_SESSION', () => {
      expect(saga.next().value).toEqual(put({ type: NEW_SESSION, id: 'x', token: 'token' }))
    })

    it('should dispatch type: LOGIN_SUCCEEDED if successful', () => {
      expect(saga.next().value).toEqual(put({ type: LOGIN_SUCCEEDED, id: 'x', token: 'token' }))
    })

    it('should call error handler on catch', () => {
      failure = saga.clone()
      failure.throw('error1')
      expect(mockErrorHandler).toHaveBeenLastCalledWith('error1')
    })

    it('should be done', () => {
      expect(saga.next().done).toBe(true)
      expect(failure.next().done).toBe(true)
    })
  })

  describe('#logoutUser', () => {
    const saga = cloneableGenerator(logoutUser)()
    let failure

    it('should dispatch NEW_SESSION', () => {
      expect(saga.next().value).toEqual(put({ type: NEW_SESSION, id: '', token: '' }))
    })

    it('should call deleteLoginData', () => {
      expect(saga.next().value).toEqual(call(deleteLoginData))
    })

    it('should call wsLogout', () => {
      expect(saga.next().value).toEqual(call(window.wsLogout))
    })

    it('should call error handler on catch', () => {
      failure = saga.clone()
      failure.throw('error2')
      expect(mockErrorHandler).toHaveBeenLastCalledWith('error2')
    })

    it('should be done', () => {
      expect(saga.next().done).toBe(true)
      expect(failure.next().done).toBe(true)
    })
  })

  describe('#storeData', () => {
    const saga = cloneableGenerator(storeData)({ id: 'id', token: 'token' })
    let failure

    it('should call storeLoginData', () => {
      expect(saga.next().value).toEqual(call(storeLoginData, { id: 'id', token: 'token' }))
    })

    it('should call error handler on catch', () => {
      failure = saga.clone()
      failure.throw('error3')
      expect(mockErrorHandler).toHaveBeenLastCalledWith('error3')
    })

    it('should be done', () => {
      expect(saga.next().done).toBe(true)
      expect(failure.next().done).toBe(true)
    })
  })

  describe('#readStorage', () => {
    const saga = cloneableGenerator(readStorage)()
    let failure

    it('should call readLoginData', () => {
      expect(saga.next().value).toEqual(call(readLoginData))
    })

    it('should dispatch NEW_SESSION', () => {
      expect(saga.next({ id: 'id', token: 'token' }).value).toEqual(put({ type: NEW_SESSION, id: 'id', token: 'token' }))
    })

    it('should call error handler on catch', () => {
      failure = saga.clone()
      failure.throw('error4')
      expect(mockErrorHandler).toHaveBeenLastCalledWith('error4')
    })

    it('should be done', () => {
      expect(saga.next().done).toBe(true)
      expect(failure.next().done).toBe(true)
    })
  })

  describe('sessionReducer handlers', () => {
    it('should return the initial state', () => {
      expect(
        reducer(undefined, {})
      ).toEqual({
        loginId: '',
        token: ''
      })
    })

    it('should handle NEW_SESSION', () => {
      expect(
        reducer({ loginId: '', token: '' }, {
          type: NEW_SESSION,
          id: 'id',
          token: 'token'
        })
      ).toEqual({ loginId: 'id', token: 'token' })
    })
  })
})
