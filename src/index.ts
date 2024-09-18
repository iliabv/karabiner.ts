import { DiffieHellmanGroup } from 'crypto'
import {
  duoLayer,
  ifApp,
  ifVar,
  layer,
  map,
  mapDoubleTap,
  mapSimultaneous,
  NumberKeyValue,
  rule,
  simlayer,
  withCondition,
  withMapper,
  withModifier,
  writeToProfile,
} from 'karabiner.ts'

let spaceHint = `\
q   w   e   r   t   y   u{  i}  o"  p'  [   ]   \\
 a   s   d   f'  g   h[  j(  k)  l]  ;   '
  z   x   c"  v   b   n   m<  ,>  /
`

const rules = [
  rule('Top Level').manipulators([
    map('caps_lock').to('left_control'),
    map('right_command').toMeh(),
    mapSimultaneous(['a', ';']).to('left_shift'),
    mapSimultaneous(['d', 'f']).to('escape'),
    mapSimultaneous(['k', 'l']).to('return_or_enter'),
    mapSimultaneous(['j', 'k']).to('return_or_enter'),
    mapSimultaneous(['j', 'n']).to('delete_or_backspace'),
    mapSimultaneous(['h', 'j']).to('delete_or_backspace'),
    mapSimultaneous(['m', ',']).to('left_shift'),
    mapSimultaneous(['x', 'c']).to('right_shift'),
    withModifier('left_command')([map('right_command').toHyper()]),
    withModifier('Meh')([
      map('spacebar').to('delete_or_backspace'),
      map('h').to('left_arrow'),
      map('j').to('down_arrow'),
      map('k').to('up_arrow'),
      map('l').to('right_arrow'),
      map('e').toApp('Emacs'),
      map('b').toApp('Arc'),
      map('a').toApp('Arc'),
      map('s').toApp('Slack'),
      map('v').toApp('Visula Studio Code'),
    ]),
  ]),
  layer(['spacebar', 'e'], 'space-mode')
    .notification(spaceHint)
    .modifiers('⌘')
    .manipulators([
      map('u').to('[', 'left_shift'),
      map('i').to(']', 'left_shift'),
      map('h').to('['),
      map('j').to('9', 'left_shift'),
      map('k').to('0', 'left_shift'),
      map('l').to(']'),
      map('m').to(',', 'left_shift'),
      map(',').to('.', 'left_shift'),
      map('f').to('quote'),
      map('c').to('quote', 'left_shift'),
      map('p').to('quote'),
      map('o').to('quote', 'left_shift'),
    ]),
]

writeToProfile('Personal', rules, {
  'basic.simultaneous_threshold_milliseconds': 200,
  'basic.to_if_held_down_threshold_milliseconds': 200,
  'duo_layer.threshold_milliseconds': 200,
})

// ! Change '--dry-run' to your Karabiner-Elements Profile name.
// (--dry-run print the config json into console)
// + Create a new profile if needed.
false &&
  writeToProfile('--dry-run', [
    // It is not required, but recommended to put symbol alias to layers,
    // to make it easier to write '←' instead of 'left_arrow'.
    // Supported alias: https://github.com/evan-liu/karabiner.ts/blob/main/src/utils/key-alias.ts
    layer('/', 'symbol-mode').manipulators([
      //     / + [ 1    2    3    4    5 ] =>
      withMapper(['⌘', '⌥', '⌃', '⇧', '⇪'])((k, i) =>
        map((i + 1) as NumberKeyValue).toPaste(k),
      ),
      withMapper(['←', '→', '↑', '↓', '␣', '⏎', '⇥', '⎋', '⌫', '⌦', '⇪'])((k) =>
        map(k).toPaste(k),
      ),
    ]),

    // If you type fast, use simlayer instead, see https://github.com/yqrashawn/GokuRakuJoudo/blob/master/tutorial.md#simlayers
    simlayer('z', 'emoji-mode').manipulators([
      map('m').toPaste('🔀'), // Merge branches
    ]),

    // In Karabiner-Elements a 'rule' is a group of manipulators.
    // layer() and simlayer() are extended rule().
    rule('Shell command').manipulators([
      // Use to$() to run a shell command
      map('⎋', 'Hyper').to$('rm -rf ~/wip'),
      // toApp() is shortcut for to$('open -a {app}.app')
      map('f', 'Meh').toApp('Finder'),
    ]),

    // There are multiple ways of using modifiers
    rule('Modifiers').manipulators([
      // You can use their key_code
      map('a', ['left_command', 'left_option']).to('b', ['fn']),
      // Or alias (easier to write if mapped to a layer)
      map('a', { left: '⌘⌥' }).to('b', 'fn'),
      // Or if it can be either left or right side:
      map('a', '⌘⌥').to('b', 'fn'),

      // 'Hyper' is ⌘⌥⌃⇧ and 'Meh' is ⌥⌃⇧
      // ⚠️ Note: Modifier alias (command|option|control|shift and ⌘⌥⌃⇧)
      //          can only be used as modifiers, but not as key_code
      map('right_command').toHyper(),
      map('⇪').toMeh().toIfAlone('⇪'),
      map('a', 'Hyper').to('b', 'Meh'),

      // Add optional modifiers after the mandatory modifiers. About optional modifiers:
      // https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/from/modifiers/#frommodifiersoptional
      map('a', '⌘', 'any').to('b'), // ⌘⇧a -> ⇧b
    ]),

    // Rules can have conditions which will be added to all manipulators.
    rule('Conditions', ifApp('^com.apple.finder$')).manipulators([
      // manipulators can also have multiple conditions
      // layer/simlayer are behind a 'variable_if' condition.
      // use unless() to switch {condition}_if to {condition}_unless
      map(0).to(1).condition(ifVar('vi-mode'), ifVar('stop').unless()),
    ]),

    // Optional parameters can be set when use
    // - from.simultaneous  - basic.simultaneous_threshold_milliseconds
    // - to_if_alone        - basic.to_if_alone_timeout_milliseconds
    // - to_if_held_down    - basic.to_if_held_down_threshold_milliseconds
    // - to_delayed_action  - basic.to_delayed_action_delay_milliseconds
    rule('Parameters').manipulators([
      map('left_option')
        .toIfAlone('r', '⌘')
        .parameters({ 'basic.to_if_alone_timeout_milliseconds': 500 }),
    ]),

    // There are some other useful abstractions over the json config.
    // [File an issue](https://github.com/evan-liu/karabiner.ts/issues) to suggest more.
    rule('Other abstractions').manipulators([
      // Move the mouse cursor to a position and (optionally) to a screen.
      map('↑', 'Meh').toMouseCursorPosition({ x: '100%', y: 0 }),
      map('→', 'Meh').toMouseCursorPosition({ x: '50%', y: '50%', screen: 1 }),
    ]),

    // There are also some useful utilities
    rule('Utility').manipulators([
      // For nested conditions inside rules/layers
      map(0).to(1).condition(ifVar('a')),
      // You can group them using withCondition()
      withCondition(ifVar('a'))([
        map(0).to(1),
        map(1).to(2).condition(ifApp('X').unless()), // And nest more conditions.
      ]),

      // Use withMapper() to apply the same mapping
      withMapper({ c: 'Calendar', f: 'Finder' })((k, v) =>
        map(k, 'Meh').toApp(v),
      ),

      // And some others like double-tap
      mapDoubleTap(1).to('w', '⌘'),
    ]),
  ])

/*
Karabiner-Elements profile parameters can also be set by the 3rd parameter
of writeToProfile('profileName', [ rules ], { params }). The default values are:

// Karabiner-Elements parameters
'basic.to_if_alone_timeout_milliseconds': 1000,
'basic.to_if_held_down_threshold_milliseconds': 500,
'basic.to_delayed_action_delay_milliseconds': 500,
'basic.simultaneous_threshold_milliseconds': 50,
'mouse_motion_to_scroll.speed': 100,

// karabiner.ts only parameters
//   for simlayer()
'simlayer.threshold_milliseconds': 200
//   for mapDoubleTap()
'double_tap.delay_milliseconds': 200,

 */
