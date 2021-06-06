import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {

    const [formData, setData] = useState({
        email: '',
        password: ''
    });

    const { email, password } = formData;

    console.log(email, password)

    const onChange = (e) => setData({ ...formData, [e.target.name]: e.target.value });
    const onSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
    }

    return (
        <Fragment>
            <h1 className="large text-primary">Log In</h1>
            <form className="form" action="create-profile.html" onSubmit={e => onSubmit(e)}>
                <div className="form-group">
                    <input type="email" placeholder="Email Address" name="email" value={email} onChange={e => onChange(e)} required />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        minLength="6"
                        value={password}
                        onChange={e => onChange(e)}
                        required
                    />
                </div>
                <input type="submit" className="btn btn-primary" value="Login" />
            </form>
            <p className="my-1">
                Not have an account? <Link to="register">Sign Up</Link>
            </p>
        </Fragment>
    )
}

export default Login;