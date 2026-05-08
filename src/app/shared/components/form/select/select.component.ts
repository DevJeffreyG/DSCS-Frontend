
import { Component, Input, Output, EventEmitter, OnChanges, OnInit, SimpleChanges } from '@angular/core';

export interface Option {
  value: any;
  label: string;
}

@Component({
  selector: 'app-select',
  imports: [],
  templateUrl: './select.component.html',
})
export class SelectComponent implements OnChanges, OnInit {
  @Input() options: Option[] = [];
  @Input() placeholder: string = 'Select an option';
  @Input() className: string = '';
  @Input() defaultValue: any = '';
  @Input() value: any = '';

  @Output() valueChange = new EventEmitter<any>();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value'] || changes['defaultValue']) {
      if (this.value === null || this.value === undefined || this.value === '') {
        this.value = this.defaultValue;
      }
    }
  }

  ngOnInit() {
    if (this.value === null || this.value === undefined || this.value === '') {
      this.value = this.defaultValue;
    }
  }

  onChange(event: Event) {
    let value: any = (event.target as HTMLSelectElement).value;
    
    // Convert string value back to original type if needed
    if (this.options.length > 0 && value !== '') {
      const selectedOption = this.options.find(opt => String(opt.value) === value);
      if (selectedOption) {
        // Use the original type from the option
        value = selectedOption.value;
      }
    }
    
    this.value = value;
    this.valueChange.emit(value);
  }
}