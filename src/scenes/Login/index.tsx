/* eslint-disable no-alert */
import { LoadingOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import {
    Button,
    Card, Col,
    Form,
    Input, Row, Spin,
} from 'antd';
import { inject, observer } from 'mobx-react';
import './index.less';

import { FormInstance } from 'antd/lib/form';
import { L } from 'lib/abpUtility';
import { Redirect } from 'react-router-dom';
import AccountStore from 'stores/accountStore';
import AuthenticationStore from 'stores/authenticationStore';
import SessionStore from 'stores/sessionStore';
import Stores from 'stores/storeIdentifier';
// import TenantAvailabilityState from 'services/account/dto/tenantAvailabilityState';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

import LoginModel from 'models/Login/loginModel';
import React from 'react';
import rules from './index.validation';
import Cookies from 'js-cookie';
import ProjectStore from 'stores/projectStore';
import Notify from 'components/Notify';
import { firestore } from 'firebase';
import { UserInfo } from 'models/User/dto';


const FormItem = Form.Item;
declare let abp: any;

export interface ILoginProps {
  authenticationStore?: AuthenticationStore;
  sessionStore?: SessionStore;
  accountStore?: AccountStore;
  projectStore?: ProjectStore;
  history: any;
  location: any;
}

interface State {
  visible: boolean;
  loading: boolean;
}

const styleCustom = {
    zIndex: 99999,
    top: 0,
    left: 0,
    width: '100%',
    // position: 'absolute',
};
@inject(Stores.AuthenticationStore, Stores.SessionStore, Stores.AccountStore,Stores.ProjectStore)
@observer
class Login extends React.Component<ILoginProps, State>
{
  state = {
      visible: false,
      loading: false,
  };
  formRef = React.createRef<FormInstance>();

  componentDidMount():void
  {
      //   const auth = getAuth();
      //   alert(auth.currentUser?.email);

  }

  handleSubmit = async (values: LoginModel): Promise<void> =>
  {
      this.setState({ loading: true });
      const { authenticationStore } = this.props;

      if (!authenticationStore)
      {
          return;
      }

      //   const { loginModel } = authenticationStore;

      const auth = getAuth();
      signInWithEmailAndPassword(auth, values.userNameOrEmailAddress, values.password)
          .then(async(userCredential) =>
          {
              // Signed in
              const user = userCredential.user;
              await firestore.getByDoc('Users',user.uid).then((doc:UserInfo)=>
              {
                  if (doc.disable)
                  {
                      Notify('error','T??i kho???n c???a b???n b??? kh??a h??y li??n h??? qu???n tr??? vi??n ????? bi???t th??m chi ti???t');
                      auth.signOut();
                  }
                  else
                  {
                      Cookies.set('Abp.AuthToken',user.getIdToken());
                      const { state } = location as any;
                      
                      window.location = state ? state.from.pathname : '/';
                  }
                
              });
              this.setState({ loading: false });
              

          })
          .catch((_error) =>
          {
              const errorCode = _error.code;
              this.setState({ loading: false });

              switch (errorCode)
              {
                  case 'auth/invalid-email':
                  {
                      Notify('error',`?????a ch??? email '${values.userNameOrEmailAddress}' kh??ng t???n t???i tr??n h??? th???ng t??i kho???n!!`);
                      break;
                  }
                  case 'auth/wrong-password':
                  {
                      Notify('error','B???n ???? nh???p sai m???t kh???u vui l??ng ki???m tra l???i!!');
                      break;
                  }
                  default:
                      break;
              }

          });


  };
  showModal = (): void =>
  {
      this.setState({ visible: !this.state.visible });
  };

  public render(): JSX.Element
  {
      const { location } = this.props;

      const { from } = location.state || { from: { pathname: '/' } };

     
      if (abp.auth.getToken())
      {
          return <Redirect to={from} />;
      }
      
      return (
          <Form
              ref={this.formRef}
              className=""
              style={{
                  alignSelf: 'center',
                  flex: 1,
              }}
              onFinish={this.handleSubmit}
          >
              {
                  this.state.loading && (
                      <>
                          <div style={{ ...styleCustom, background: 'gray', opacity: 0.55, position: 'absolute', height: '100%' }} />
                          <div style={{ ...styleCustom, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', height: '100vh' }}>
                              <Spin
                                  indicator={<LoadingOutlined />}
                                  spinning={this.state.loading}
                                  size="large"
                              />
                          </div>
                      </>
                  )
              }
             
              <Row style={{ marginTop: 10 }}>
                  <Col
                      span={8}
                      offset={8}
                  >
                      <Card>
                          <div style={{ textAlign: 'center' }}>
                              <h1>{L('Ch??o m???ng tr??? l???i.')}</h1>
                          </div>
                          <FormItem
                              name="userNameOrEmailAddress"
                              rules={rules.userNameOrEmailAddress}
                          >
                              <Input
                                  placeholder={L('T??n ????ng nh???p ho???c Email')}
                                  prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                  size="large"
                              />
                          </FormItem>

                          <FormItem
                              name="password"
                              rules={rules.password}
                          >
                              <Input.Password
                                  placeholder={L('M???t kh???u')}
                                  prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                                  size="large"
                              />
                          </FormItem>
                          <Row style={{ margin: '0px 0px 10px 15px ' }}>
                              <Col
                                  span={12}
                                  offset={0}
                              />
                          </Row>
                          <Row>
                              <Col span={4} />
                              <Col span={16}>
                                  <Button
                                      style={{
                                          backgroundColor: '#f5222d',
                                          color: 'white',
                                          width: '100%',
                                          borderRadius: '4px',
                                          height: '40px',
                                      }}
                                      htmlType="submit"
                                      danger
                                  >
                                      {L('????ng nh???p')}
                                  </Button>
                              </Col>
                              <Col span={4} />
                          </Row>
                      </Card>
                  </Col>
              </Row>
          </Form>
      );
  }
}

export default Login;
