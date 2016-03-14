import React, {Component} from 'react';
import {reduxForm} from 'redux-form';
import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';
import attemptLogin from './userActions';

class LoginFormComponent extends Component {
  render() {
    const {fields: {email, password}, handleSubmit, onSubmitLoginForm, submitting} = this.props;
    return (
      <form onSubmit={handleSubmit(onSubmitLoginForm.bind(this))}>
        <TextField
          floatingLabelText="Email"
          errorText={email.touched ? email.error : ''}
          {...email}
        />
        <br />
        <TextField
          floatingLabelText="Password"
          type="password"
          errorText={password.touched ? password.error : ''}
          {...password}
        />
        <br />
        <RaisedButton type="submit" label="Login" primary={true} disabled={submitting}/>
      </form>
    );
  }
}
LoginFormComponent.propTypes = {
  fields: React.PropTypes.object.isRequired,
  onSubmitLoginForm: React.PropTypes.func.isRequired,
  submitting: React.PropTypes.bool.isRequired
};

const mapStateToProps = (state) => {
  return {
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onSubmitLoginForm: (values) => {
      dispatch(attemptLogin(values.email,values.password));
    }
  };
};

// in-browser validation callback
function validate(values){
  const errors = {};
  if (!values.email || values.email.trim() === '') {
    errors.email = "You forgot to enter your email address";
  }
  if (!values.password || values.password.trim() === '') {
    errors.password = "You forgot to enter your password";
  }
  return errors;
}

const reduxFormConfig = {
  form: 'login',
  fields: ['email', 'password'],
  validate
}

const LoginForm = reduxForm(reduxFormConfig,mapStateToProps,mapDispatchToProps)(LoginFormComponent);

export default LoginForm;