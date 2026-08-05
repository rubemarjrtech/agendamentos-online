import { validate } from 'class-validator';
import { CreateLockRequestDto } from './create-lock-request.dto';

describe('CreateLockRequestDto', () => {
  let dto: CreateLockRequestDto;

  beforeEach(() => {
    dto = new CreateLockRequestDto();
  });

  it('should pass validation with valid serviceId, date, and time', async () => {
    // Arrange
    dto.serviceId = 'cm1serviceid123';
    dto.date = '2026-08-15';
    dto.time = '10:30';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors).toHaveLength(0);
  });

  it('should fail validation when serviceId is missing', async () => {
    // Arrange
    dto.serviceId = '';
    dto.date = '2026-08-15';
    dto.time = '10:30';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'serviceId')).toBe(true);
  });

  it('should fail validation when date is missing', async () => {
    // Arrange
    dto.serviceId = 'cm1serviceid123';
    dto.date = '';
    dto.time = '10:30';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'date')).toBe(true);
  });

  it('should fail validation when time is missing', async () => {
    // Arrange
    dto.serviceId = 'cm1serviceid123';
    dto.date = '2026-08-15';
    dto.time = '';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'time')).toBe(true);
  });

  it('should fail validation when date format is invalid', async () => {
    // Arrange
    dto.serviceId = 'cm1serviceid123';
    dto.date = '15-08-2026';
    dto.time = '10:30';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'date')).toBe(true);
  });

  it('should fail validation when serviceId is not a string', async () => {
    // Arrange
    // @ts-expect-error - testing invalid type
    dto.serviceId = 123;
    dto.date = '2026-08-15';
    dto.time = '10:30';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'serviceId')).toBe(true);
  });

  it('should fail validation when date is not a string', async () => {
    // Arrange
    dto.serviceId = 'cm1serviceid123';
    // @ts-expect-error - testing invalid type
    dto.date = 20260815;
    dto.time = '10:30';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'date')).toBe(true);
  });

  it('should fail validation when time is not a string', async () => {
    // Arrange
    dto.serviceId = 'cm1serviceid123';
    dto.date = '2026-08-15';
    // @ts-expect-error - testing invalid type
    dto.time = 1030;

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'time')).toBe(true);
  });
});
