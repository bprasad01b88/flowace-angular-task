import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { USERS } from './users';
@Component({
  selector: 'app-select-user',
  templateUrl: './select-user.component.html',
  styleUrls: ['./select-user.component.css']
})
export class SelectUserComponent {
  allUsers = USERS;
  displayedUsers : any = [];
  searchTerm = '';
  displayCount = 10;
  incrementCount = 5;
  dropdownOpen = false;
  selectedUser = '';
  
  @ViewChild('dropdown', { static: false }) dropdown: ElementRef | any;

  constructor(private eRef: ElementRef) {
    this.loadInitialUsers();
  }

  loadInitialUsers() {
    this.displayedUsers = this.allUsers.slice(0, this.displayCount);
  }

  onDropdownOpen() {
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen) {
      this.loadInitialUsers();
    }
  }

  onScroll() {
    const scrollTop = this.dropdown.nativeElement.scrollTop;
    const scrollHeight = this.dropdown.nativeElement.scrollHeight;
    const offsetHeight = this.dropdown.nativeElement.offsetHeight;
    const isAtBottom = scrollTop + offsetHeight >= scrollHeight - 1;

    if (isAtBottom && this.displayedUsers.length < this.allUsers.length) {
      const nextUsers = this.allUsers.slice(this.displayedUsers.length, this.displayedUsers.length + this.incrementCount);
      this.displayedUsers = [...this.displayedUsers, ...nextUsers];
    }
  }

  onSearchChange() {
    const filteredUsers = this.allUsers.filter(user =>
      user.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.displayedUsers = filteredUsers.slice(0, this.displayCount);
  }

  selectUser(user : any) {
    this.selectedUser = user.name;
    this.dropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
    }
  }  
}
