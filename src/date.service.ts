import * as dayjs from 'dayjs';
import { OpUnitType, QUnitType } from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import * as pt from 'dayjs/locale/pt-br';

export class DateService {

    static dayJs(date: string): dayjs.Dayjs {
        return dayjs(date);
    }

    /**
        * Transforma a data em Dayjs
        * @param {string} date a data que será transformada para Dayjs
        * @param {number} format o formato da @param date
    */
    static parse(date: string, format = 'DD/MM/YYYY'): dayjs.Dayjs {
        dayjs.extend(customParseFormat);
        return dayjs(date, format);
    }

    /**
        * Formata um objeto Dayjs em um formato específico
        * @param {string} date a data que será formatada
        * @param {number} format o formato da @param date
        * @param {string} to o formato da @param date que deseja
    */
    static format(date: string, format = 'DD/MM/YYYY', to = 'YYYY-MM-DD'): string {
        dayjs.locale(pt);
        dayjs.extend(customParseFormat);
        return dayjs(date, format).format(to);
    }

    /**
        * Verifica se a data está em um formato correto
        * @param {string} date a data que será validada
        * @param {number} format o formato da @param date
    */
    static isValid(date: string, format = 'DD/MM/YYYY'): boolean {
        dayjs.extend(customParseFormat);
        return dayjs(date, format).format(format) === date;
    }

    /**
        * Verifica se a data é anterior a data atual
        * @param {dayjs.Dayjs} date a data que será comparada
        * @param {dayjs.OpUnitType} param o parametro a ser comparado entre as datas
    */
    static isBefore(date: dayjs.Dayjs, param: dayjs.OpUnitType = 'days'): boolean {
        return date.isBefore(dayjs(), param);
    }

    /**
        * Entrega uma data no formato YYYY-MM-DD
    */
    static date(format = 'YYYY-MM-DD'): string {
        dayjs.locale(pt);
        return dayjs().format(format);
    }

    /**
        * Subtrai a data com um valor desejado
        * @param {string} date a data que será subtraída
        * @param {number} value o valor a ser subtraído
        * @param {dayjs.OpUnitType | undefined} unit o unidade do @param value que será subtraído
    */
    static subtract(date: string, value: number, unit: dayjs.OpUnitType | undefined): string {
        return dayjs(date).subtract(value, unit).format('YYYY-MM-DD').toString();
    }

    
    /**
        * Calcula a diferença entre duas datas
        * @param {string} date a data inicial que será calculada
        * @param {string} date2 a data final que será calculada
        * @param {QUnitType | OpUnitType} unit a unidade de retorno do método
        * @param {boolean} float se o valor de retorno terá números decimais
    */
    static diff(date: string, date2: string, unit: QUnitType | OpUnitType = 'days', float = false): number {
        return dayjs(date).diff(dayjs(date2), unit, float);
    }
}
