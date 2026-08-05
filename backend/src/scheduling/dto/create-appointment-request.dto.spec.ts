import { validate } from 'class-validator';
import { CreateAppointmentRequestDto } from './create-appointment-request.dto';

describe('CreateAppointmentRequestDto', () => {
  let dto: CreateAppointmentRequestDto;

  beforeEach(() => {
    dto = new CreateAppointmentRequestDto();
  });

  it('should pass validation with all valid fields', async () => {
    // Arrange
    dto.serviceId = 'cm1serviceid123';
    dto.date = '2026-08-15';
    dto.time = '10:30';
    dto.clientName = 'João Silva';
    dto.clientPhone = '+5511999999999';

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
    dto.clientName = 'João Silva';
    dto.clientPhone = '+5511999999999';

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
    dto.clientName = 'João Silva';
    dto.clientPhone = '+5511999999999';

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
    dto.clientName = 'João Silva';
    dto.clientPhone = '+5511999999999';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'time')).toBe(true);
  });

  it('should fail validation when clientName is missing', async () => {
    // Arrange
    dto.serviceId = 'cm1serviceid123';
    dto.date = '2026-08-15';
    dto.time = '10:30';
    dto.clientName = '';
    dto.clientPhone = '+5511999999999';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'clientName')).toBe(true);
  });

  it('should fail validation when clientPhone is missing', async () => {
    // Arrange
    dto.serviceId = 'cm1serviceid123';
    dto.date = '2026-08-15';
    dto.time = '10:30';
    dto.clientName = 'João Silva';
    dto.clientPhone = '';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'clientPhone')).toBe(true);
  });

  it('should fail validation when date format is invalid', async () => {
    // Arrange
    dto.serviceId = 'cm1serviceid123';
    dto.date = '15-08-2026';
    dto.time = '10:30';
    dto.clientName = 'João Silva';
    dto.clientPhone = '+5511999999999';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'date')).toBe(true);
  });

  it('should fail validation when clientPhone is not Brazilian format', async () => {
    // Arrange
    dto.serviceId = 'cm1serviceid123';
    dto.date = '2026-08-15';
    dto.time = '10:30';
    dto.clientName = 'João Silva';
    dto.clientPhone = '123'; // invalid phone

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'clientPhone')).toBe(true);
    expect(errors.find((e) => e.property === 'clientPhone')?.constraints?.isPhoneNumber).toContain(
      'Número de telefone inválido. Ex: +5511999999999',
    );
  });

  it('should fail validation when clientPhone has invalid characters', async () => {
    // Arrange
    dto.serviceId = 'cm1serviceid123';
    dto.date = '2026-08-15';
    dto.time = '10:30';
    dto.clientName = 'João Silva';
    dto.clientPhone = '+55-11-9999-9999';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'clientPhone')).toBe(true);
  });

  it('should fail validation when serviceId is not a string', async () => {
    // Arrange
    // @ts-expect-error - testing invalid type
    dto.serviceId = 123;
    dto.date = '2026-08-15';
    dto.time = '10:30';
    dto.clientName = 'João Silva';
    dto.clientPhone = '+5511999999999';

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
    dto.clientName = 'João Silva';
    dto.clientPhone = '+5511999999999';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'date')).toBe(true);
  });

  it('should fail validation when clientName is not a string', async () => {
    // Arrange
    dto.serviceId = 'cm1serviceid123';
    dto.date = '2026-08-15';
    dto.time = '10:30';
    // @ts-expect-error - testing invalid type
    dto.clientName = 123;
    dto.clientPhone = '+5511999999999';

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'clientName')).toBe(true);
  });

  it('should fail validation when clientPhone is not a string', async () => {
    // Arrange
    dto.serviceId = 'cm1serviceid123';
    dto.date = '2026-08-15';
    dto.time = '10:30';
    dto.clientName = 'João Silva';
    // @ts-expect-error - testing invalid type
    dto.clientPhone = 5511999999999;

    // Act
    const errors = await validate(dto);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'clientPhone')).toBe(true);
  });
});
