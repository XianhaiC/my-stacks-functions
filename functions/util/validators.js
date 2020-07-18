const isBlank = (val) => {
  if (val === null
    || val === undefined
    || val.trim() === '') return true;

  return false;
}

const isEmail = (email) => {
  const emailRegEx =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (email.match(emailRegEx)) return true;
  else return false;
}

exports.validateUserSignup = (data) => {
  let errors = {};

  // email
  if (isBlank(data.email))
    errors.email = 'Must not be empty';
  else if (!isEmail(data.email))
    errors.email = 'Must be a valid email address';

  // password
  if (isBlank(data.password))
    errors.password = 'Must not be empty';

  // confirm password
  if (data.password !== data.confirmPassword)
    errors.confirmPassword = 'Passwords must match';

  return {
    errors,
    valid: Object.keys(errors).length === 0
  }
}

exports.validateUserLogin = (data) => {
  let errors = {};

  // email
  if (isBlank(data.email)) errors.email = 'Must not be empty';

  // password
  if (isBlank(data.password)) errors.password = 'Must not be empty';

  return {
    errors,
    valid: Object.keys(errors).length === 0
  }
}

exports.reduceUserDetails = (data) => {
  let userDetails = {};

  if (!isBlank(data.bio.trim())) userDetails.bio = data.bio;
  if (!isBlank(data.website.trim())) {
    if (data.website.trim().substring(0, 4) !== 'http') {
      userDetails.website = `http://${data.website.trim()}`;
    }
    else userDetails.website = data.website;
  }

  if (!isBlank(data.location.trim())) userDetails.location = data.location;

  return userDetails;
}
