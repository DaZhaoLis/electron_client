import 'mobx-react-lite/batchingForReactDom';
import Store from '../Store';
import { observable } from 'mobx';

export default class UserStore extends Store {
  @observable user: any = {};

  persistMap = {
    sqlite: ['user'],
  };

  ready(): Promise<void> {
    super.ready();
    return Promise.resolve();
  }
}
