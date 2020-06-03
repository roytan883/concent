import { makeStoreConfig, extractMessage } from './util';
import { run, getState, setState, reducer, set, cst, configure, dispatch, cloneModule } from '../src/index';

const Foo = 'foo';
const Bar = 'bar';

test('run concent app with a store config', async () => {
  run(makeStoreConfig('foo'));

  const fooState = getState(Foo);
  expect(fooState.name).toBe(Foo);
  expect(fooState.age).toBe(22);

  const buildInGlobalState = getState(cst.MODULE_GLOBAL);
  expect(buildInGlobalState).toBeTruthy();
  const buildInDefaultState = getState(cst.MODULE_DEFAULT);
  expect(buildInDefaultState).toBeTruthy();
  const buildInCcState = getState(cst.MODULE_CC);
  expect(buildInCcState).toBeTruthy();

  expect(reducer[Foo].changeName).toBeInstanceOf(Function);

  // test undeclared module name
  try {
    setState('undeclared module name', { bar: 222 });
  } catch (err) {
    expect(extractMessage(err)).toMatch(/(?=is not declared in store)/);
  }

  setState(Foo, { undeclaredKey: 222 });
  expect(fooState.undeclaredKey).toEqual(undefined);
  expect(Object.keys(fooState).length).toEqual(3);

  setState(Foo, { name: 'gogo' });
  expect(fooState.name).toBe('gogo');

  setState(Foo, { name: 'concent', age: 1 });
  expect(fooState.name).toBe('concent');
  expect(fooState.age).toBe(1);

  expect(fooState.info.addr).toBe('bj');
  expect(fooState.info.email).toBe('x@concent.com');
  set(`${Foo}/info.addr`, 'omega');
  set(`${Foo}/info.email`, 'y@concent.com');
  expect(fooState.info.addr).toBe('omega');
  expect(fooState.info.email).toBe('y@concent.com');

  try{
    configure();
  }catch(err){
    expect(extractMessage(err)).toMatch(/(?=param config is not a plain json object!)/);
  }

  /** test configure  */
  configure(Bar, makeStoreConfig(Bar)[Bar]);
  expect(reducer[Bar].changeName).toBeInstanceOf(Function);

  const barState = getState(Bar);
  expect(barState.name).toBe(Bar);
  expect(barState.age).toBe(22);

  /** test dispatch  */
  await dispatch(`${Bar}/changeName`, 'dispatchedName');
  expect(barState.name).toBe('dispatchedName');

  /** test reducer  */
  await reducer[Bar].changeName('aNewNameSendedByReducer');
  expect(barState.name).toBe('aNewNameSendedByReducer');

  /** test cloneModule  */
  const clonedModule = 'newBar';
  cloneModule(clonedModule, Bar);
  const newBarState = getState(clonedModule);
  expect(newBarState).toBeTruthy();
  expect(reducer[clonedModule].changeName).toBeInstanceOf(Function);
  await dispatch(`${clonedModule}/changeName`, 'well,see what happen');
  expect(newBarState.name).toBe('well,see what happen');

});