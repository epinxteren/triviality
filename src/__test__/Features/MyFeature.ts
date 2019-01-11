import { Feature } from '../../Feature';
import { Container } from '../../Container';
import { MyOtherFeature } from './MyOtherFeature';

export class MyFeature implements Feature {

  constructor(private container: Container<MyOtherFeature>) {

  }

  public myFeature(): string {
    return 'MyFeature';
  }

  public referenceToMyOtherFeature(): string {
    return this.container.myOtherFeature();
  }

}
