/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as assert from 'assert';
suite('CharCode', () => {
    test('has good values', () => {
        function assertValue(actual, expected) {
            assert.strictEqual(actual, expected.charCodeAt(0), 'char code ok for <<' + expected + '>>');
        }
        assertValue(9 /* CharCode.Tab */, '\t');
        assertValue(10 /* CharCode.LineFeed */, '\n');
        assertValue(13 /* CharCode.CarriageReturn */, '\r');
        assertValue(32 /* CharCode.Space */, ' ');
        assertValue(33 /* CharCode.ExclamationMark */, '!');
        assertValue(34 /* CharCode.DoubleQuote */, '"');
        assertValue(35 /* CharCode.Hash */, '#');
        assertValue(36 /* CharCode.DollarSign */, '$');
        assertValue(37 /* CharCode.PercentSign */, '%');
        assertValue(38 /* CharCode.Ampersand */, '&');
        assertValue(39 /* CharCode.SingleQuote */, '\'');
        assertValue(40 /* CharCode.OpenParen */, '(');
        assertValue(41 /* CharCode.CloseParen */, ')');
        assertValue(42 /* CharCode.Asterisk */, '*');
        assertValue(43 /* CharCode.Plus */, '+');
        assertValue(44 /* CharCode.Comma */, ',');
        assertValue(45 /* CharCode.Dash */, '-');
        assertValue(46 /* CharCode.Period */, '.');
        assertValue(47 /* CharCode.Slash */, '/');
        assertValue(48 /* CharCode.Digit0 */, '0');
        assertValue(49 /* CharCode.Digit1 */, '1');
        assertValue(50 /* CharCode.Digit2 */, '2');
        assertValue(51 /* CharCode.Digit3 */, '3');
        assertValue(52 /* CharCode.Digit4 */, '4');
        assertValue(53 /* CharCode.Digit5 */, '5');
        assertValue(54 /* CharCode.Digit6 */, '6');
        assertValue(55 /* CharCode.Digit7 */, '7');
        assertValue(56 /* CharCode.Digit8 */, '8');
        assertValue(57 /* CharCode.Digit9 */, '9');
        assertValue(58 /* CharCode.Colon */, ':');
        assertValue(59 /* CharCode.Semicolon */, ';');
        assertValue(60 /* CharCode.LessThan */, '<');
        assertValue(61 /* CharCode.Equals */, '=');
        assertValue(62 /* CharCode.GreaterThan */, '>');
        assertValue(63 /* CharCode.QuestionMark */, '?');
        assertValue(64 /* CharCode.AtSign */, '@');
        assertValue(65 /* CharCode.A */, 'A');
        assertValue(66 /* CharCode.B */, 'B');
        assertValue(67 /* CharCode.C */, 'C');
        assertValue(68 /* CharCode.D */, 'D');
        assertValue(69 /* CharCode.E */, 'E');
        assertValue(70 /* CharCode.F */, 'F');
        assertValue(71 /* CharCode.G */, 'G');
        assertValue(72 /* CharCode.H */, 'H');
        assertValue(73 /* CharCode.I */, 'I');
        assertValue(74 /* CharCode.J */, 'J');
        assertValue(75 /* CharCode.K */, 'K');
        assertValue(76 /* CharCode.L */, 'L');
        assertValue(77 /* CharCode.M */, 'M');
        assertValue(78 /* CharCode.N */, 'N');
        assertValue(79 /* CharCode.O */, 'O');
        assertValue(80 /* CharCode.P */, 'P');
        assertValue(81 /* CharCode.Q */, 'Q');
        assertValue(82 /* CharCode.R */, 'R');
        assertValue(83 /* CharCode.S */, 'S');
        assertValue(84 /* CharCode.T */, 'T');
        assertValue(85 /* CharCode.U */, 'U');
        assertValue(86 /* CharCode.V */, 'V');
        assertValue(87 /* CharCode.W */, 'W');
        assertValue(88 /* CharCode.X */, 'X');
        assertValue(89 /* CharCode.Y */, 'Y');
        assertValue(90 /* CharCode.Z */, 'Z');
        assertValue(91 /* CharCode.OpenSquareBracket */, '[');
        assertValue(92 /* CharCode.Backslash */, '\\');
        assertValue(93 /* CharCode.CloseSquareBracket */, ']');
        assertValue(94 /* CharCode.Caret */, '^');
        assertValue(95 /* CharCode.Underline */, '_');
        assertValue(96 /* CharCode.BackTick */, '`');
        assertValue(97 /* CharCode.a */, 'a');
        assertValue(98 /* CharCode.b */, 'b');
        assertValue(99 /* CharCode.c */, 'c');
        assertValue(100 /* CharCode.d */, 'd');
        assertValue(101 /* CharCode.e */, 'e');
        assertValue(102 /* CharCode.f */, 'f');
        assertValue(103 /* CharCode.g */, 'g');
        assertValue(104 /* CharCode.h */, 'h');
        assertValue(105 /* CharCode.i */, 'i');
        assertValue(106 /* CharCode.j */, 'j');
        assertValue(107 /* CharCode.k */, 'k');
        assertValue(108 /* CharCode.l */, 'l');
        assertValue(109 /* CharCode.m */, 'm');
        assertValue(110 /* CharCode.n */, 'n');
        assertValue(111 /* CharCode.o */, 'o');
        assertValue(112 /* CharCode.p */, 'p');
        assertValue(113 /* CharCode.q */, 'q');
        assertValue(114 /* CharCode.r */, 'r');
        assertValue(115 /* CharCode.s */, 's');
        assertValue(116 /* CharCode.t */, 't');
        assertValue(117 /* CharCode.u */, 'u');
        assertValue(118 /* CharCode.v */, 'v');
        assertValue(119 /* CharCode.w */, 'w');
        assertValue(120 /* CharCode.x */, 'x');
        assertValue(121 /* CharCode.y */, 'y');
        assertValue(122 /* CharCode.z */, 'z');
        assertValue(123 /* CharCode.OpenCurlyBrace */, '{');
        assertValue(124 /* CharCode.Pipe */, '|');
        assertValue(125 /* CharCode.CloseCurlyBrace */, '}');
        assertValue(126 /* CharCode.Tilde */, '~');
    });
});