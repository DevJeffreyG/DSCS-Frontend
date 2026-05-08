import { TestBed } from '@angular/core/testing';

import { LoggeduserService } from './loggeduser.service';

describe('LoggeduserService', () => {
  let service: LoggeduserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoggeduserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
