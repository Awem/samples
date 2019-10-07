import { call, put, takeEvery } from 'redux-saga/effects'
import { deleteLoginData, readLoginData, storeLoginData } from '../../helpers'
import { buildReducer } from '../utils'
import { errorHandler } from '../../lib/errorHandler'

/*
 * action types
 */
export const LOGIN_SUCCEEDED = 'LOGIN_SUCCEEDED'
export const LOGOUT_REQUESTED = 'LOGOUT_REQUESTED'
export const NEW_SESSION = 'NEW_SESSION'
export const SESSION_FROM_QUERY = 'SESSION_FROM_QUERY'
export const SESSION_FROM_STORAGE = 'SESSION_FROM_STORAGE'

export const actionTypes = {
  LOGIN_SUCCEEDED,
  LOGOUT_REQUESTED,
  NEW_SESSION,
  SESSION_FROM_QUERY,
  SESSION_FROM_STORAGE
}

/*
 * action creators
 */
export function sessionFromQuery (credentials) {
  return {
    type: SESSION_FROM_QUERY,
    credentials
  }
}
export function logoutRequested () {
  return {
    type: LOGOUT_REQUESTED
  }
}
export function sessionFromStorage () {
  return {
    type: SESSION_FROM_STORAGE
  }
}

export const actionCreators = {
  logoutRequested,
  sessionFromQuery,
  sessionFromStorage
}

/*
 * sagas
 */
export function* loginUser ({ credentials }) {
  try {
    const { id, token } = credentials
    yield put({ type: NEW_SESSION, id, token })
    yield put({ type: LOGIN_SUCCEEDED, id, token })
  } catch (error) {
    yield errorHandler(error)
  }
}
export function* logoutUser () {
  try {
    yield put({ type: NEW_SESSION, token: '', id: '' })
    yield call(deleteLoginData)
    yield call(window.wsLogout)
  } catch (error) {
    yield errorHandler(error)
  }
}
export function* storeData ({ id, token }) {
  try {
    yield call(storeLoginData, { id, token })
  } catch (error) {
    yield errorHandler(error)
  }
}
export function* readStorage () {
  try {
    const { id, token } = yield call(readLoginData)
    yield put({ type: NEW_SESSION, token, id })
  } catch (error) {
    yield errorHandler(error)
  }
}

export function* mainSaga () {
  yield takeEvery(SESSION_FROM_QUERY, loginUser)
  yield takeEvery(LOGIN_SUCCEEDED, storeData)
  yield takeEvery(LOGOUT_REQUESTED, logoutUser)
  yield takeEvery(SESSION_FROM_STORAGE, readStorage)
}

/*
 * action handlers
 */
const actionHandlers = {
  [NEW_SESSION]: (state, { id, token }) => ({ ...state, token, loginId: id })
}

/*
 * reducer
 */
const initialState = {
  loginId: '',
  token: ''
}
export const reducer = buildReducer(actionHandlers, initialState)
