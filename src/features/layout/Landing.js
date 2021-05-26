import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class Landing extends React.PureComponent {
  render() {
    const { isAuthenticated } = this.props.user;

    return (
      <div style={{ height: '75vh' }} className="container valign-wrapper">
        <div className="row">
          <div className="col s12 center-align">
            <h4>
              <b>Build</b> a login/auth app with the{' '}
              <span style={{ fontFamily: 'monospace' }}>MERN</span> stack from
              scratch
            </h4>
            <p className="flow-text grey-text text-darken-1">
              Create a (minimal) full-stack app with user authentication via
              passport and JWTs
            </p>
            <br />
            {!isAuthenticated
              ? <>
                <div className="col s6">
                  <Link
                    to="/register"
                    style={{
                      width: '140px',
                      borderRadius: '3px',
                      letterSpacing: '1.5px',
                    }}
                    className="btn btn-large waves-effect waves-light hoverable blue accent-3"
                  >
                    Register
                  </Link>
                </div>
                <div className="col s6">
                  <Link
                    to="/login"
                    style={{
                      width: '140px',
                      borderRadius: '3px',
                      letterSpacing: '1.5px',
                    }}
                    className="btn btn-large btn-flat waves-effect white black-text"
                  >
                    Log In
                  </Link>
                </div>
              </>
              : (
              <div className="row">
              <Link
                to="/dashboard"
                style={{
                  borderRadius: '3px',
                  letterSpacing: '1.5px',
                }}
                className="btn btn-large waves-effect waves-light hoverable blue accent-3"
              >
                Dashboard
              </Link>
            </div>
              )}
            {}
          </div>
        </div>
      </div>
    );
  }
}
Landing.propTypes = {
  user: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  user: state.user,
});

export default connect(mapStateToProps)(Landing);
