const isBlank = (val) => {
  if (isNull(val) || val.trim() === '')
    return true;

  return false;
}

const isNull = (val) => {
  if (val === null
    || val === undefined)
    return true;

  return false;
}
exports.isNull = isNull;

const isEmail = (email) => {
  const emailRegEx =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (email.match(emailRegEx)) return true;
  else return false;
}

exports.validateUserSignup = (data) => {
  let errors = {};

  if (isBlank(data.email))
    errors.email = 'Must not be empty';
  else if (!isEmail(data.email))
    errors.email = 'Must be a valid email address';

  if (isBlank(data.password))
    errors.password = 'Must not be empty';

  if (data.password !== data.confirmPassword)
    errors.confirmPassword = 'Passwords must match';

  return {
    errors,
    valid: Object.keys(errors).length === 0
  }
}

exports.validateUserLogin = (data) => {
  let errors = {};

  if (isBlank(data.email)) errors.email = 'Must not be empty';

  if (isBlank(data.password)) errors.password = 'Must not be empty';

  return {
    errors,
    valid: Object.keys(errors).length === 0
  }
}

exports.validateStackCreate = (data) => {
  let errors = {};

  if (isBlank(data.name)) errors.name = 'Must not be empty';

  if (isNull(data.isRoutine)) errors.isRoutine = 'Must exist';

  if (isNull(data.isInbox)) errors.isInbox = 'Must exist';
 
  if (isNull(data.backgroundColor)) errors.backgroundColor = 'Must exist';

  if (isNull(data.durationGrace)) errors.durationGrace = 'Must exist';

  return {
    errors,
    valid: Object.keys(errors).length === 0
  }
}

exports.validateStackUpdate = (data) => {
  let errors = {};

  if (Object.keys(data).length === 0) errors.general = 'Must update at least one field';

  if ("name" in data && isBlank(data.name)) errors.name = 'Must not be empty';

  if ("isRoutine" in data && isNull(data.isRoutine)) errors.isRoutine = 'Must exist';

  if ("isInbox" in data && isNull(data.isInbox)) errors.isInbox = 'Must exist';
 
  if ("backgroundColor" in data && isNull(data.backgroundColor)) errors.backgroundColor = 'Must exist';

  if ("order" in data && isNull(data.order)) errors.order = 'Must exist';

  if ("durationGrace" in data && isNull(data.durationGrace)) errors.durationGrace = 'Must exist';

  return {
    errors,
    valid: Object.keys(errors).length === 0
  }
}

exports.validateBlockCreate = (data) => {
  let errors = {};

  if (isBlank(data.task)) errors.task = 'Must not be empty';

  if (isNull(data.description)) errors.description = 'Must exist';

  if (isNull(data.durationWork)) errors.durationWork = 'Must exist';

  if (isNull(data.durationBreak)) errors.durationBreak = 'Must exist';
 
  if (isNull(data.numBursts)) errors.numBursts = 'Must exist';

  if (isNull(data.stackId)) errors.stackId = 'Must exist';

  return {
    errors,
    valid: Object.keys(errors).length === 0
  }
}

exports.validateBlockUpdate = (data) => {
  let errors = {};

  if (Object.keys(data).length === 0) errors.general = 'Must update at least one field';

  if ("task" in data && isBlank(data.task)) errors.task = 'Must not be empty';

  if ("description" in data && isNull(data.description)) errors.description = 'Must exist';

  if ("durationWork" in data && isNull(data.durationWork)) errors.durationWork = 'Must exist';
 
  if ("durationBreak" in data && isNull(data.durationBreak)) errors.durationBreak = 'Must exist';

  if ("numBursts" in data && isNull(data.numBursts)) errors.numBursts = 'Must exist';

  if ("durationGrace" in data && isNull(data.durationGrace)) errors.durationGrace = 'Must exist';

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
