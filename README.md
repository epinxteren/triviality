# Table of Contents

* [Triviality](#triviality)
* [Installation](#installation)
* [Thanks](#thanks)
* [Reads](#reads)


# Triviality

Dependency Injection is all about code reusability. 
It’s a design pattern aiming to make high-level code reusable, 
by separating the object creation / configuration from usage. **Triviality** highly aims to keep away from your application code. 
**No magic** injection with tokens, annotations whatsoever. It will use your application code 
as **strictly typed interface** to assure everything is connected properly. 

Triviality by core is split into Modules. A module is defined as a class. Each module has his own services definitions 
so each module can serve it's unique and there separate logic.


```typescript
import { Module } from 'triviality';
import { LoggerInterface } from './LoggerInterface';

export class LogModule implements Module {
  public logger(): LoggerInterface {
    return console;
  }
}

```
        

As you can see a module class has functions on them. The function name is the service name. The function implementation the service factory. Before we can call the service from the container
we need to build it:


```typescript
import { ContainerFactory } from 'triviality';
import { LogModule } from './LogModule';

ContainerFactory
  .create()
  .add(LogModule)
  .build()
  .then((container) => {
    const logger = container.logger();
    logger.info('Hallo word');
  });

```
        

Now we can fetch the 'logger' service from the container and start using it. This service will be a singleton based on the service factory arguments.


```typescript
import { Module } from 'triviality';
import { LoggerInterface } from '../module/LoggerInterface';

export class LogModule implements Module {

  public logger(): LoggerInterface {
    return console;
  }

  public prefixedLoggerService(prefix: string): LoggerInterface {
    return {
      info: (...message: string[]) => this.logger().info(...[prefix, ...message]),
    };
  }

}

```
        

The logger service function and the 'prefixedLoggerService' functions will always return the same instance for the same arguments. 


```typescript
import { ContainerFactory } from 'triviality';
import { LogModule } from './LogModule';

ContainerFactory
  .create()
  .add(LogModule)
  .build()
  .then((container) => {
    const johnLogger = container.prefixedLoggerService('John:');
    johnLogger.info('Hallo Jane!');
    const janeLogger = container.prefixedLoggerService('Jane:');
    janeLogger.info('Hi John!');

  });

```
        
___

The container service function types are directly copied from the Modules.
This gives typescript the option to **strictly type check** if everything is connected properly. 
And you the benefits of **code completion** and the option to quickly traverse to the service chain.
___


Let's put the type checking to the test, we create a nice module that use the 'LogModule'.


```typescript
import { HalloService } from './HalloService';
import { Container, Module } from 'triviality';
import { LogModule } from '../module/LogModule';

export class HalloModule implements Module {

  constructor(private container: Container<LogModule>) {
  }

  public halloService(name: string): HalloService {
    return new HalloService(this.container.logger(), name);
  }
}

```
        

The container:


```typescript
import { ContainerFactory } from 'triviality';
import { HalloModule } from './HalloModule';

ContainerFactory
  .create()
  .add(HalloModule)
  .build()
  .then((container) => {
    const service = container.halloService('John');
    service.speak(); // console.info("Hallo John");.
  });

```
        

If you forget a module you see a nice error of typescript in your IDE.

![alt text](../example/moduleDependency/HalloModuleErrorContainer.png "Module requirement error")

    Error:(6, 8) TS2345: Argument of type 'typeof HalloModule' is not assignable to parameter of type 'ModuleConstructor<HalloModule, {}>'.
      Types of parameters 'container' and 'container' are incompatible.
        Property 'logger' is missing in type '{}' but required in type 'Readonly<Pick<LogModule, "logger">>'.

Let's fix the error with:


```typescript
import { ContainerFactory } from 'triviality';
import { LogModule } from '../singleton/LogModule';
import { HalloModule } from './HalloModule';

ContainerFactory
  .create()
  .add(LogModule)
  .add(HalloModule)
  .build()
  .then((container) => {
    const service = container.halloService('John');
    service.speak(); // console.info("Hallo John");.
  });

```
        

# Installation

To install the stable version:

```
yarn add triviality
```

This assumes you are using [yarn](https://yarnpkg.com) as your package manager.

or 

```
npm install triviality
```

# Thanks

Special thanks to:

* Eric Pinxteren
* Wessel van der Linden

# Reads

Triviality is inspired by [disco](https://github.com/bitExpert/disco) without the annotations.

