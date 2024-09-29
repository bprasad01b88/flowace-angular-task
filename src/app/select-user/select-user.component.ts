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
  displayCount = 10; // Number of users to load initially
  incrementCount = 5; // Number of users to load on each scroll
  dropdownOpen = false;
  selectedUser = '';
  
  @ViewChild('dropdown', { static: false }) dropdown: ElementRef | any;

  constructor(private eRef: ElementRef) {
    this.loadInitialUsers();
  }

  // Load initial users
  loadInitialUsers() {
    this.displayedUsers = this.allUsers.slice(0, this.displayCount);
  }

  // Toggle dropdown visibility
  onDropdownOpen() {
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen) {
      this.loadInitialUsers(); // Reset the user list when dropdown opens
    }
  }

  // Scroll event handler: Load more users if at the bottom of the list
  onScroll() {
    const scrollTop = this.dropdown.nativeElement.scrollTop;
    const scrollHeight = this.dropdown.nativeElement.scrollHeight;
    const offsetHeight = this.dropdown.nativeElement.offsetHeight;
    const isAtBottom = scrollTop + offsetHeight >= scrollHeight - 1;

    // Load more users only if we are at the bottom of the dropdown and there are more users to load
    if (isAtBottom && this.displayedUsers.length < this.allUsers.length) {
      const nextUsers = this.allUsers.slice(this.displayedUsers.length, this.displayedUsers.length + this.incrementCount);
      this.displayedUsers = [...this.displayedUsers, ...nextUsers];
    }
  }

  // Handle user search
  onSearchChange() {
    const filteredUsers = this.allUsers.filter(user =>
      user.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.displayedUsers = filteredUsers.slice(0, this.displayCount);
  }

  // Handle user selection
  selectUser(user : any) {
    this.selectedUser = user.name; // Set the selected user's name
    this.dropdownOpen = false; // Close the dropdown after selection
  }

  // Close the dropdown if a click occurs outside the component
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
    }
  }  
}
