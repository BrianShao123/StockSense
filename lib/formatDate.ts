import { Timestamp } from 'firebase/firestore';

function formatDate(timeUpdated: any): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZone: 'UTC',
    timeZoneName: 'short'
  };

  if (timeUpdated instanceof Date) {
    return new Intl.DateTimeFormat('en-US', options).format(timeUpdated);
  } else if (timeUpdated instanceof Timestamp) {
    return new Intl.DateTimeFormat('en-US', options).format(timeUpdated.toDate());
  } else {
    return 'Invalid Date';
  }
}

export default formatDate;
