drop database if exists GestorDeMatriculasVehiculas_in5cm;
create database GestorDeMatriculasVehiculas_in5cm;
use GestorDeMatriculasVehiculas_in5cm;

create table usuario (
    id_usuario int auto_increment primary key,
    nombre varchar(100) not null,
    email varchar(100) unique not null,
    telefono varchar(20),
    password varchar(255) not null,
    rol varchar(20) default 'usuario',
    fecha_registro datetime default current_timestamp
);

create table tipo_vehiculo (
    id_tipo int auto_increment primary key,
    nombre varchar(50) not null,
    descripcion varchar(200)
);

create table marca (
    id_marca int auto_increment primary key,
    nombre varchar(100) not null
);

create table vehiculo (
    id_vehiculo int auto_increment primary key,
    id_usuario int not null,
    placa varchar(20) unique not null,
    id_tipo int not null,
    id_marca int not null,
    modelo varchar(100),
    anio int,
    color varchar(50),
    owner_name varchar(100),
    fecha_registro datetime default current_timestamp,
    foreign key (id_usuario) references usuario(id_usuario),
    foreign key (id_tipo) references tipo_vehiculo(id_tipo),
    foreign key (id_marca) references marca(id_marca)
);

create table estado_matricula (
    id_estado int auto_increment primary key,
    nombre varchar(50) not null,
    descripcion varchar(200)
);

create table matricula (
    id_matricula int auto_increment primary key,
    id_vehiculo int not null,
    id_estado int default 2,
    fecha_inicio datetime not null,
    fecha_vencimiento datetime not null,
    monto decimal(10,2) not null,
    fecha_pago datetime,
    comprobante varchar(255),
    notas text,
    fecha_registro datetime default current_timestamp,
    foreign key (id_vehiculo) references vehiculo(id_vehiculo),
    foreign key (id_estado) references estado_matricula(id_estado)
);

create table documento (
    id_documento int auto_increment primary key,
    id_matricula int not null,
    tipo varchar(50) not null,
    contenido text,
    fecha datetime default current_timestamp,
    estado varchar(20) default 'activo',
    foreign key (id_matricula) references matricula(id_matricula)
);

create table pago (
    id_pago int auto_increment primary key,
    id_matricula int not null,
    monto decimal(10,2) not null,
    fecha_pago datetime default current_timestamp,
    metodo_pago varchar(50),
    estado varchar(20) default 'pendiente',
    transaccion varchar(100),
    foreign key (id_matricula) references matricula(id_matricula)
);

create table notificacion (
    id_notif int auto_increment primary key,
    id_usuario int not null,
    id_matricula int,
    mensaje text not null,
    tipo varchar(50),
    fecha datetime default current_timestamp,
    estado varchar(20) default 'pendiente',
    foreign key (id_usuario) references usuario(id_usuario),
    foreign key (id_matricula) references matricula(id_matricula)
);

create table historial (
    id_historial int auto_increment primary key,
    id_matricula int,
    id_usuario int,
    accion varchar(50) not null,
    descripcion text,
    fecha datetime default current_timestamp,
    valores_old text,
    valores_new text,
    foreign key (id_matricula) references matricula(id_matricula),
    foreign key (id_usuario) references usuario(id_usuario)
);

insert into tipo_vehiculo (nombre, descripcion) values
('carro', 'automóvil / vehículo particular'),
('moto', 'motocicleta'),
('camion', 'camión / vehículo de carga'),
('autobus', 'autobús / vehículo de transporte público');

insert into marca (nombre) values
('toyota'), ('ford'), ('chevrolet'), ('honda'), ('nissan'),
('hyundai'), ('volkswagen'), ('mazda'), ('kia'), ('bmw'),
('mercedes-benz'), ('audi'), ('jeep'), ('tesla'), ('dodge');

insert into estado_matricula (nombre, descripcion) values
('activa', 'matrícula vigente y válida'),
('vencida', 'matrícula con fecha de vencimiento superada'),
('pendiente', 'matrícula en proceso de aprobación'),
('cancelada', 'matrícula cancelada por el usuario');

insert into usuario (nombre, email, telefono, password, rol) values
('administrador dti', 'admin@dti.gob.gt', '5555-5555', 'admin123hashed', 'administrador');

insert into usuario (nombre, email, telefono, password, rol) values
('josue chan', 'josue.chan@email.com', '5555-1234', 'user123hashed', 'usuario');

insert into vehiculo (id_usuario, placa, id_tipo, id_marca, modelo, anio, color, owner_name) values
(2, 'gt12345', 1, 1, 'corolla', 2022, 'blanco', 'josue chan');

insert into matricula (id_vehiculo, id_estado, fecha_inicio, fecha_vencimiento, monto) values
(1, 1, '2026-01-01', '2027-01-01', 250.00);

insert into pago (id_matricula, monto, fecha_pago, metodo_pago, estado, transaccion) values
(1, 250.00, '2026-01-01', 'tarjeta', 'completado', 'txn-20260101-001');

insert into notificacion (id_usuario, id_matricula, mensaje, tipo, estado) values
(2, 1, 'su matrícula vencerá el 01/01/2027. recuerde renovar.', 'vencimiento', 'pendiente');

select * from usuario;
select * from tipo_vehiculo;
select * from marca;
select * from vehiculo;
select * from estado_matricula;
select * from matricula;
select * from documento;
select * from pago;
select * from notificacion;
select * from historial;