import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Configuration, OpenAIApi } from 'openai';
import { BusinessException } from '../code/BusinessException';
import { ErrorCode } from '../code/ErrorCode';
import EventEmitter from 'events';
import { EventEmitterService } from '../event/eventEmitter.service';

@Injectable()
export class ChatGPTService {
    private openai: OpenAIApi;
    private logger: Logger = new Logger(ChatGPTService.name);


    constructor(
        private eventEmitterService: EventEmitterService
    ) {
        const configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.openai = new OpenAIApi(configuration);
        
    }

    /**
     * 通过OpenAI GPT-3 分析用户行为，给出一个不需要解释得分原因，具有讽刺意味、无厘头的理由。
     * 
     *
     */
    public async getKeywords(address,res,listener,tx, days, gasFee, postNum) {
        let allText = '';
        const payload = {
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'user',
                content: this.generateKeywordsPrompt(tx, days, gasFee, postNum)
            }],
            temperature: 0.7,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            max_tokens: 2048,
            stream: true,
            n: 1
        }
        try {
            const chatGptResponse = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                payload,{
                    headers: {'Content-Type': 'application/json',
                        Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}`
                    },
                    responseType: 'stream'
                }
            );
            chatGptResponse.data.on('data', (chunk: Buffer) => {
                // 将chunk转换为字符串
                const data = chunk.toString('utf-8');

                // 处理chatgpt的返回数据，并将text部分转发给前端
                const lines = data.split('\n');
                lines.forEach((line: string) => {
                    if (line.startsWith('data:')) {
                        const text = line.replace('data:', '').trim();
                        if (text !== '') {
                            if (text === '[DONE]') {
                                console.log('chatgpt返回结束');
                                return allText;
                            } else {
                                try {
                                    const jsoned = JSON.parse(text);
                                    if (
                                        jsoned.choices[0].delta &&
                                        jsoned.choices[0].delta.content
                                    ) {
                                        const textword = jsoned.choices[0].delta.content;
                                        allText += textword;
                                        
                                        this.eventEmitterService.emitter.emit('textword', textword);
                                    } else {
                                        console.log('jsoned.choices[0].delta.content不存在', text);
                                    }
                                } catch (e) {
                                    console.log('jsoned error', e);
                                }
                            }
                        }
                    }
                });
            });

            chatGptResponse.data.on('end', () => {
                this.logger.log(`chatGptResponse: ${allText}`);
                res.write(`event: end\n`);
                res.write('data: Stream ended\n\n');
                res.end();
                this.eventEmitterService.emitter.off('textword', listener);
                if (this.eventEmitterService.addressData.has(address)) {
                    let data = this.eventEmitterService.addressData.get(address);
                    data.textword = allText;
                    data.fraction=this.getFraction(tx,days,gasFee,postNum);
                    this.eventEmitterService.addressData.set(address, data);
                  }
            });
            
        } catch (error) {
            console.log(error);
        }
    }


    private generateKeywordsPrompt(tx, time, gasFee, postNum) {
        return `计分方案：
        1. 交易数量 (TX) - 40分
        0-10笔交易：0分 (萌新)
        11-50笔交易：10分 (新手)
        51-100笔交易：20分 (老手)
        101-500笔交易：30分 (你是会亏Gas的)
        500笔以上交易：40分 (女巫，绝对是女巫)

        2. ETH生涯 - 30分
        少于30天：0分 (老账号被盗了吧？)
        30-90天：10分 (看起来你很嫩)
        90-365天：15分 (这么久还没亏完？)
        365-1000天：20分 (你是会亏Gas的)
        1000天以上：30分 (安全交易30年，没人比你更懂安全)

        3. Gas费用 (GasFee) - 30分
        少于0.05 ETH：0分 (你是不是没钱了？)
        0.05-0.1 ETH：10分 (你还可以再亏一点)
        0.1-0.2 ETH：15分 (你是会亏Gas的)
        0.2-0.5 ETH：20分 (你亏的Gas，可以买个新手机了)
        0.5-1 ETH：25分 (你亏的Gas，可以买个新电脑了)
        1 ETH 以上：30分 (丰密老师，是你吗？！)

        4. Mirror上的文章 (研报) - 35分
        没有研报：0分 (你是不是不会写研报？)
        1-3篇研报：10分 (老板，加油！）
        3-5篇研报：25分 (哥，带带！)
        5-10篇研报：30分 (哥，带带弟弟！)
        10篇及以上研报：35分 (老板！带带弟弟弟弟！)

        根据用户的得分、交易时间差,消耗的Gas,Mirrors数量。用评分标准后面阔号内容做关键词。
        分析他的行为，给出一个不需要解释得分原因，具有讽刺意味、无厘头的理由。  
        在分数和理由中间，输出一个能让Html换行的标签。
        注意严格遵守数据之间的逻辑性，不要乱编数据，不要出现不合理的数据。
        请模仿下面的格式进行回复:    
        
        你的得分为：${this.getFraction(tx,time,gasFee,postNum)}分。
        当前地址的Tx为：${tx}, ETH生涯：${time} 天 , Gas费用为：${gasFee} ETH, Mirror上的文章数量为：${postNum}。

        理由：  
        1.交易数量得分为30分，说明你是会亏Gas的，不愧是花钱如流水的主。  
        2.ETH生涯得分为20分，说明你是个老手了，但看起来你还没亏完。  
        3.Gas费用得分为25分，说明你亏的Gas费用可以买个新电脑了，不过还不够丰密老师的水平。  
        4.Mirror上的文章得分为30分，说明你写了不少研报，希望你能继续努力，带带更多的弟弟们。  
        
        `;
    }

    getFraction(tx,time,gasFee,postNum){
        let fraction = 0;
        if(tx >= 0 && tx <= 10){
            fraction += 0;
        }else if(tx >= 11 && tx <= 50){
            fraction += 10;
        }else if(tx >= 51 && tx <= 100){
            fraction += 20;
        }else if(tx >= 101 && tx <= 500){
            fraction += 30;
        }else if(tx > 500){
            fraction += 40;
        }

        if(time >= 0 && time <= 30){
            fraction += 0;
        }else if(time >= 30 && time <= 90){
            fraction += 10;
        }else if(time >= 90 && time <= 365){
            fraction += 15;
        }else if(time >= 365 && time <= 1000){
            fraction += 20;
        }else if(time > 1000){
            fraction += 30;
        }

        if(gasFee >= 0 && gasFee <= 0.05){
            fraction += 0;
        }else if(gasFee >= 0.05 && gasFee <= 0.1){
            fraction += 10;
        }else if(gasFee >= 0.1 && gasFee <= 0.2){
            fraction += 15;
        }else if(gasFee >= 0.2 && gasFee <= 0.5){
            fraction += 20;
        }else if(gasFee >= 0.5 && gasFee <= 1){
            fraction += 25;
        }else if(gasFee > 1){
            fraction += 30;
        }

        if(postNum >= 0 && postNum <= 1){
            fraction += 0;
        }else if(postNum >= 1 && postNum <= 3){
            fraction += 10;
        }else if(postNum >= 3 && postNum <= 5){
            fraction += 25;
        }else if(postNum >= 5 && postNum <= 10){
            fraction += 30;
        }else if(postNum > 10){
            fraction += 35;
        }

        return fraction;
    }


    
}
