export const FormStateType = {
  INICIAL: "inicial",
  UBICACION_CONFIRMADA: "ubicacion_confirmada",
  ARCHIVOS_SELECCIONADOS: "archivos_seleccionados",
  ENVIANDO: "enviando",
  COMPLETADO: "completado",
  ERROR: "error",
};

export class FormContext {
  constructor(initialState) {
    this.state = initialState;
  }

  setState(newState) {
    console.log(
      `[State Pattern] Cambiando de estado: ${this.state.getStateName()} -> ${newState.getStateName()}`
    );
    this.state = newState;
    this.state.context = this;
  }

  confirmarUbicacion() {
    this.state.confirmarUbicacion();
  }

  seleccionarArchivos() {
    this.state.seleccionarArchivos();
  }

  enviar() {
    this.state.enviar();
  }

  reset() {
    this.state.reset();
  }

  getCurrentState() {
    return this.state;
  }
}

export class InicialState {
  constructor(context) {
    this.context = context;
  }

  confirmarUbicacion() {
    console.log("[State] Transición: INICIAL -> UBICACION_CONFIRMADA");
    this.context.setState(new UbicacionConfirmadaState(this.context));
  }

  seleccionarArchivos() {
    console.log("[State] Acción ignorada: No hay ubicación confirmada");
  }

  enviar() {
    console.log("[State] Acción ignorada: No hay ubicación confirmada");
  }

  reset() {}

  getStateName() {
    return "INICIAL";
  }
}

export class UbicacionConfirmadaState {
  constructor(context) {
    this.context = context;
  }

  confirmarUbicacion() {
    console.log("[State] Acción ignorada: Ubicación ya confirmada");
  }

  seleccionarArchivos() {
    console.log(
      "[State] Transición: UBICACION_CONFIRMADA -> ARCHIVOS_SELECCIONADOS"
    );
    this.context.setState(new ArchivosSeleccionadosState(this.context));
  }

  enviar() {
    console.log("[State] Transición: UBICACION_CONFIRMADA -> ENVIANDO");
    this.context.setState(new EnviandoState(this.context));
  }

  reset() {
    console.log("[State] Reiniciando a estado INICIAL");
    this.context.setState(new InicialState(this.context));
  }

  getStateName() {
    return "UBICACION_CONFIRMADA";
  }
}

export class ArchivosSeleccionadosState {
  constructor(context) {
    this.context = context;
  }

  confirmarUbicacion() {
    console.log("[State] Acción ignorada: Ubicación ya confirmada");
  }

  seleccionarArchivos() {
    console.log("[State] Archivos ya seleccionados");
  }

  enviar() {
    console.log("[State] Transición: ARCHIVOS_SELECCIONADOS -> ENVIANDO");
    this.context.setState(new EnviandoState(this.context));
  }

  reset() {
    console.log("[State] Reiniciando a estado INICIAL");
    this.context.setState(new InicialState(this.context));
  }

  getStateName() {
    return "ARCHIVOS_SELECCIONADOS";
  }
}

export class EnviandoState {
  constructor(context) {
    this.context = context;
  }

  confirmarUbicacion() {
    console.log("[State] Acción ignorada: Enviando reporte");
  }

  seleccionarArchivos() {
    console.log("[State] Acción ignorada: Enviando reporte");
  }

  enviar() {
    console.log("[State] Acción ignorada: Ya está enviando");
  }

  reset() {
    console.log("[State] Reiniciando a estado INICIAL");
    this.context.setState(new InicialState(this.context));
  }

  getStateName() {
    return "ENVIANDO";
  }
}

export class CompletadoState {
  constructor(context) {
    this.context = context;
  }

  confirmarUbicacion() {
    console.log("[State] Transición: COMPLETADO -> UBICACION_CONFIRMADA");
    this.context.setState(new UbicacionConfirmadaState(this.context));
  }

  seleccionarArchivos() {
    console.log("[State] Transición: COMPLETADO -> ARCHIVOS_SELECCIONADOS");
    this.context.setState(new ArchivosSeleccionadosState(this.context));
  }

  enviar() {
    console.log("[State] Acción ignorada: Ya fue completado");
  }

  reset() {
    console.log("[State] Reiniciando a estado INICIAL");
    this.context.setState(new InicialState(this.context));
  }

  getStateName() {
    return "COMPLETADO";
  }
}

export class ErrorState {
  constructor(context) {
    this.context = context;
  }

  confirmarUbicacion() {
    console.log("[State] Transición: ERROR -> UBICACION_CONFIRMADA");
    this.context.setState(new UbicacionConfirmadaState(this.context));
  }

  seleccionarArchivos() {
    console.log("[State] Transición: ERROR -> ARCHIVOS_SELECCIONADOS");
    this.context.setState(new ArchivosSeleccionadosState(this.context));
  }

  enviar() {
    console.log("[State] Acción ignorada: Hubo un error");
  }

  reset() {
    console.log("[State] Reiniciando a estado INICIAL");
    this.context.setState(new InicialState(this.context));
  }

  getStateName() {
    return "ERROR";
  }
}

