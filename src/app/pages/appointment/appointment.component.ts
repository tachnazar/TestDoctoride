import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment } from 'moment';
const moment = _rollupMoment || _moment;
interface Time {
  value: string;
  viewValue: string;
}
export interface DialogData {
  startDateTime: string;
  endDateTime: string;
}
@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
})
export class AppointmentComponent {
  times: Time[] = [];
  selectedEndTime: string;
  dateTimeForm: FormGroup;

  constructor(private formBuilder: FormBuilder, public dialog: MatDialog) {}
  ngOnInit() {
    this.generateTime();
    this.createForm();
  }
  selectionChanged() {
    this.dateTimeForm.patchValue({
      endTime: moment(this.dateTimeForm.controls['startTime'].value, 'HH:mm')
        .add('1', 'hours')
        .format('HH:mm'),
    });
  }
  generateTime() {
    const intervals = ['00', '15', '30', '45'];
    for (let indexHour = 0; indexHour < 24; indexHour++) {
      for (let indexMin = 0; indexMin < 4; indexMin++) {
        if (indexHour < 10) {
          this.times.push({
            value: '0' + indexHour + ':' + intervals[indexMin],
            viewValue: '0' + indexHour + ':' + intervals[indexMin],
          });
        } else {
          this.times.push({
            value: indexHour + ':' + intervals[indexMin],
            viewValue: indexHour + ':' + intervals[indexMin],
          });
        }
      }
    }
  }
  createForm() {
    this.dateTimeForm = this.formBuilder.group(
      {
        startDate: [moment(), Validators.required],
        startTime: [this.setDefaultStartTime(), Validators.required],
        endDate: [moment(), Validators.required],
        endTime: [this.setDefaultEndTime(), Validators.required],
      },
      {
        validator: this.checkDates,
      }
    );
  }
  setDefaultStartTime() {
    const compareTime = moment(moment(), 'HH:mm');
    const closestTime = this.times.find((time) => {
      const diff = moment(time.value, 'HH:mm').diff(compareTime, 'minutes');
      return diff >= 0;
    });
    console.log(closestTime);
    return closestTime?.value;
  }
  setDefaultEndTime() {
    const compareTime = moment(moment(), 'HH:mm');
    const closestTime = this.times.find((time) => {
      const diff = moment(time.value, 'HH:mm').diff(compareTime, 'minutes');
      return diff >= 0;
    });
    console.log(
      closestTime,
      moment(closestTime?.value, 'HH:mm').add('10', 'minutes').format('HH:mm')
    );
    return moment(closestTime?.value, 'HH:mm')
      .add('1', 'hours')
      .format('HH:mm');
  }
  checkDates(group: FormGroup) {
    console.log(group.controls);
    const startTime = moment(group.controls['startTime'].value, 'HH:mm');
    const endTime = moment(group.controls['endTime'].value, 'HH:mm');
    const startDateTime = moment(group.controls['startDate'].value).set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
    const endDateTime = moment(group.controls['endDate'].value).set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

    if (
      moment(endDateTime).isBefore(startDateTime) &&
      !moment(endDateTime).isSame(startDateTime)
    ) {
      return { invalidDate: true };
    }
    console.log(startDateTime, endDateTime);
    if (
      moment(endDateTime).isSame(startDateTime) &&
      endTime.isBefore(startTime)
    ) {
      return { invalidTime: true };
    }
    return null;
  }
  public onSubmit() {
    console.log('submit', this.dateTimeForm);
    const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      panelClass: 'custom-dialog-container',
      data: {
        startDateTime: moment(this.dateTimeForm.value.startDate)
          .set({
            hour: moment(this.dateTimeForm.value.startTime, 'HH:mm').get(
              'hour'
            ),
            minute: moment(this.dateTimeForm.value.startTime, 'HH:mm').get(
              'minute'
            ),
            second: 0,
            millisecond: 0,
          })
          .toISOString(true),
        endDateTime: moment(this.dateTimeForm.value.endDate)
          .set({
            hour: moment(this.dateTimeForm.value.endTime, 'HH:mm').get('hour'),
            minute: moment(this.dateTimeForm.value.endTime, 'HH:mm').get(
              'minute'
            ),
            second: 0,
            millisecond: 0,
          })
          .toISOString(true),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
    });
  }
}
@Component({
  selector: 'dialog-result',
  templateUrl: 'dialog-result.html',
  styleUrls: ['./appointment.component.scss'],
})
export class DialogOverviewExampleDialog {
  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
