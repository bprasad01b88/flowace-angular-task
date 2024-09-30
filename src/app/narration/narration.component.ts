import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';

interface RowData {
  title: string;
  description: string;
  time: string;
  previousTime: string;
  timeError?: string;
  selected?: boolean;
  isHovered?: boolean;
}

@Component({
  selector: 'app-narration',
  templateUrl: './narration.component.html',
  styleUrls: ['./narration.component.css'],
})
export class NarrationComponent {
  hasTimeEntered: boolean = false;
  rows: RowData[] = [];
  totalTime: number = 0;
  availableTime: number = 3600;
  editingField: string | null = null;
  currentEditRow: RowData | null = null;
  savedData: any = [];
  isTimeExceeds: string = '';
  isChecked: boolean = false;
  showFloatingButton: boolean = false;
  selectedCount: number = 0;
  isModalOpen = false;
  isTableExpanded = false;
  selectedRows: number[] = [];
  @ViewChild('titleInput', { static: false }) titleInput!: ElementRef;
  @ViewChild('descriptionInput', { static: false })
  descriptionInput!: ElementRef;
  @ViewChild('timeInput', { static: false }) timeInput!: ElementRef;
  selectedDate: string | null = null;
  isShowingActivity: boolean = false;
  isTimeVerified: any = 0;

  constructor() {
    this.loadFromLocalStorage();
    this.loadTimeVerificationStates();
  }

  toggleTable() {
    this.isTableExpanded = !this.isTableExpanded;
  }

  onCheckboxChange(event: Event, index: number) {
    const checkbox = event.target as HTMLInputElement;

    if (checkbox.checked) {
      this.selectedRows.push(index);
    } else {
      const idx = this.selectedRows.indexOf(index);
      if (idx > -1) {
        this.selectedRows.splice(idx, 1);
      }
    }
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  updateFloatingButton() {
    this.selectedCount = this.rows.filter((row) => row.selected).length;
    this.showFloatingButton = this.selectedCount > 0;
  }

  getSelectedRows(): RowData[] {
    return this.rows.filter((row) => row.selected);
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.content') && this.editingField) {
      this.saveEdit();
    }
  }

  addNewRow() {
    const newRow: RowData = {
      title: '',
      description: '',
      time: '00:00:00',
      previousTime: '00:00:00',
      timeError: '',
    };

    if (this.availableTime > 0) {
      this.rows.push(newRow);
      this.saveToLocalStorage();
    } else {
      this.rows.push(newRow);
    }
  }

  editField(field: string, row: RowData) {
    this.editingField = field;
    this.currentEditRow = row;
    setTimeout(() => {
      this.titleInput?.nativeElement.focus();
    });
  }

  saveEdit() {
    if (this.currentEditRow) {
      this.currentEditRow.previousTime = this.currentEditRow.time;
      if (this.currentEditRow.time && this.currentEditRow.time !== '00:00:00') {
        this.hasTimeEntered = true;
      }
      this.saveTimeVerificationStates();
      this.saveToLocalStorage();
    }
    this.editingField = null;
    this.currentEditRow = null;
  }

  confirmDelete() {
    this.deleteSelectedRows();
    this.isModalOpen = false;
  }

  deleteSelectedRows() {
    const rowsToDelete = [...this.selectedRows].sort((a, b) => b - a);

    rowsToDelete.forEach((index) => {
      this.deleteRow(index);
    });

    this.selectedRows = [];
  }

  deleteRow(index: number) {
    const row = this.rows[index];
    const rowTimeInSeconds = this.getRowTimeInSeconds(row.time);
    this.availableTime += rowTimeInSeconds;
    this.rows.splice(index, 1);
    this.saveToLocalStorage();
    this.updateTotalTime();
  }

  validateTime(row: RowData) {
    const timeParts = row.time.split(':');
    if (timeParts.length !== 3) {
      alert('Invalid time format. Please enter in HH:MM:SS format.');
      return;
    }

    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    const seconds = parseInt(timeParts[2]);

    if (
      isNaN(hours) ||
      isNaN(minutes) ||
      isNaN(seconds) ||
      hours < 0 ||
      minutes < 0 ||
      seconds < 0 ||
      minutes >= 60 ||
      seconds >= 60
    ) {
      alert(
        'Invalid time. Please ensure that time is in the format HH:MM:SS and within valid ranges.'
      );
      return;
    }

    if (row.time && row.time !== '00:00:00') {
      this.hasTimeEntered = true; 
    } else {
      this.hasTimeEntered = false;
    }
    this.saveTimeVerificationStates(); 

    const newInputTime = hours * 3600 + minutes * 60 + seconds;
    const previousTime = this.getRowTimeInSeconds(row.previousTime);

    const potentialAvailableTime =
      this.availableTime + previousTime - newInputTime;
    this.isTimeVerified = potentialAvailableTime;

    if (newInputTime > this.availableTime + previousTime) {
      row.timeError = 'Exceeds available time';
      row.time = row.previousTime;
      return;
    }

    row.timeError = '';

    const timeDifference = newInputTime - previousTime;
    this.availableTime -= timeDifference;

    row.previousTime = row.time;
    row.time = this.formatTime(newInputTime);

    this.revalidateErrorRows();

    this.updateTotalTime();
    this.saveToLocalStorage();
  }

  revalidateErrorRows() {
    this.rows.forEach((row) => {
      if (row.timeError) {
        this.validateTime(row);
      }
    });
  }
  
  updateTotalTime() {
    this.totalTime = this.rows.reduce((acc, row) => {
      const timeParts = row.time.split(':');
      const totalRowTime =
        parseInt(timeParts[0]) * 3600 +
        parseInt(timeParts[1]) * 60 +
        parseInt(timeParts[2]);
      return acc + totalRowTime;
    }, 0);
  }

  getRowTimeInSeconds(time: string): number {
    const timeParts = time.split(':');
    return (
      parseInt(timeParts[0]) * 3600 +
      parseInt(timeParts[1]) * 60 +
      parseInt(timeParts[2])
    );
  }

  formatTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(
      seconds
    )}`;
  }

  padZero(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  loadFromLocalStorage() {
    const savedRows = localStorage.getItem('narrationRows');
    this.savedData = savedRows;
    const savedAvailableTime = localStorage.getItem('availableTime');

    if (savedRows) {
      this.rows = JSON.parse(savedRows);
    }

    if (savedAvailableTime) {
      this.availableTime = parseInt(savedAvailableTime);
    }

    this.updateTotalTime();
  }

  saveToLocalStorage() {
    localStorage.setItem('narrationRows', JSON.stringify(this.rows));
    localStorage.setItem('availableTime', this.availableTime.toString());
  }

  loadTimeVerificationStates() {
    const savedTimeVerified = localStorage.getItem('isTimeVerified');
    const savedHasTimeEntered = localStorage.getItem('hasTimeEntered');

    if (savedTimeVerified) {
      this.isTimeVerified = parseInt(savedTimeVerified);
    }

    if (savedHasTimeEntered) {
      this.hasTimeEntered = savedHasTimeEntered === 'true';
    }
  }

  saveTimeVerificationStates() {
    localStorage.setItem('isTimeVerified', this.isTimeVerified.toString());
    localStorage.setItem('hasTimeEntered', this.hasTimeEntered.toString());
  }

  viewActivities() {
    this.isShowingActivity = !this.isShowingActivity;
  }

  handleFloatingButtonClick() {
    this.getSelectedRows();
  }
}
