import { validate } from 'class-validator';
import { CheckAvailabilityRequestDto } from './check-availability-request.dto';

describe('CheckAvailabilityRequestDto', () => {
  let dto: CheckAvailabilityRequestDto;

  beforeEach(() => {
    dto = new CheckAvailabilityRequestDto();
  });

  it('should pass validation with valid date and serviceId', async () => {
    // Arrange
    dto.date = '2026-08-15';
    dto.serviceId = 'cm1serviceid123';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(0);
  });

  it('should fail validation when date is missing', async () => {
    // Arrange
    dto.date = '';
    dto.serviceId = 'cm1serviceid123';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'date')).toBe(true);
  });

  it('should fail validation when serviceId is missing', async () => {
    // Arrange
    dto.date = '2026-08-15';
    dto.serviceId = '';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'serviceId')).toBe(true);
  });

  it('should fail validation when date format is invalid', async () => {
    // Arrange
    dto.date = '15-08-2026';
    dto.serviceId = 'cm1serviceid123';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'date')).toBe(true);
  });

  it('should fail validation when date is not a string', async () => {
    // Arrange
    // @ts-expect-error - testing invalid type
    dto.date = 20260815;
    dto.serviceId = 'cm1serviceid123';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'date')).toBe(true);
  });

  it('should fail validation when serviceId is not a string', async () => {
    // Arrange
    dto.date = '2026-08-15';
    // @ts-expect-error - testing invalid type
    dto.serviceId = 123;

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'serviceId')).toBe(true);
  });
});
