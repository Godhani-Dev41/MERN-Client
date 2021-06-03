import React, { Fragment } from 'react';

const Login = () => {
    return (
        <Fragment>
            <h1 className="large text-primary">Log In</h1>
            <form className="form" action="create-profile.html">
                <div className="form-group">
                    <input type="email" placeholder="Email Address" name="email" required />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        minLength="6"
                    />
                </div>
                <input type="submit" className="btn btn-primary" value="Login" />
            </form>
            <p className="my-1">
                Not have an account? <a href="login.html">Sign Up</a>
            </p>
        </Fragment>
    )
}

export default Login;