import moment from "moment";

export function todayOrAfter(originalDate: moment.MomentInput) {
  const originalMoment = moment(originalDate);
  const startMoment = moment.max(originalMoment, moment());
  startMoment.day(originalMoment.day());
  return startMoment;
}
