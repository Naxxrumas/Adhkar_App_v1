import { supabase } from './supabase';
import { Deed, Recurrence, WorshipType, MetricType } from '../../types';

export const createDeed = async (userId: string, data: Omit<Deed, 'id' | 'userId'>) => {
    const deedData = {
        user_id: userId,
        group_id: data.groupId || 'personal',
        worship_type: data.worshipType,
        name: data.name,
        description: data.description,
        metric_type: data.metricType,
        target: data.target,
        target_secondary: data.targetSecondary,
        recurrence: data.recurrence,
        is_counter_mode: data.isCounterMode,
        privacy_level: data.privacyLevel,
        sub_items: data.subItems as any,
    };

    const { data: insertedData, error } = await supabase
        .from('deeds')
        .insert(deedData)
        .select()
        .single();

    if (error) {
        console.error("Error creating deed:", error);
        throw error;
    }

    return insertedData.id;
};

export const updateDeed = async (userId: string, deedId: string, data: Partial<Deed>) => {
    const deedData: any = {};
    if (data.groupId !== undefined) deedData.group_id = data.groupId || 'personal';
    if (data.worshipType !== undefined) deedData.worship_type = data.worshipType;
    if (data.name !== undefined) deedData.name = data.name;
    if (data.description !== undefined) deedData.description = data.description;
    if (data.metricType !== undefined) deedData.metric_type = data.metricType;
    if (data.target !== undefined) deedData.target = data.target;
    if (data.targetSecondary !== undefined) deedData.target_secondary = data.targetSecondary;
    if (data.recurrence !== undefined) deedData.recurrence = data.recurrence;
    if (data.isCounterMode !== undefined) deedData.is_counter_mode = data.isCounterMode;
    if (data.privacyLevel !== undefined) deedData.privacy_level = data.privacyLevel;
    if (data.subItems !== undefined) deedData.sub_items = data.subItems;

    const { error } = await supabase
        .from('deeds')
        .update(deedData)
        .eq('id', deedId)
        .eq('user_id', userId);

    if (error) throw error;
};

export const deleteDeed = async (userId: string, deedId: string) => {
    const { error } = await supabase
        .from('deeds')
        .delete()
        .eq('id', deedId)
        .eq('user_id', userId);

    if (error) throw error;
};

export const getUserDeeds = async (userId: string): Promise<Deed[]> => {
    const { data, error } = await supabase
        .from('deeds')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error("Error fetching deeds:", error);
        return [];
    }

    return data.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        groupId: row.group_id,
        worshipType: row.worship_type as WorshipType,
        name: row.name,
        description: row.description,
        metricType: row.metric_type as MetricType,
        target: row.target,
        targetSecondary: row.target_secondary,
        recurrence: row.recurrence as Recurrence,
        isCounterMode: row.is_counter_mode,
        privacyLevel: row.privacy_level,
        subItems: row.sub_items
    }));
};

export const getDeedPresets = (): Partial<Deed>[] => [
    {
        name: 'الصلوات الخمس',
        worshipType: WorshipType.BODY,
        metricType: MetricType.COUNT,
        target: 5,
        recurrence: Recurrence.DAILY,
        isCounterMode: false,
        privacyLevel: 'ratio'
    },
    {
        name: 'أذكار الصباح والمساء',
        worshipType: WorshipType.TONGUE,
        metricType: MetricType.COUNT,
        target: 2, // 1 morning, 1 evening maybe, or they can do one
        recurrence: Recurrence.DAILY,
        isCounterMode: true,
        privacyLevel: 'ratio'
    },
    {
        name: 'ورد القرآن',
        worshipType: WorshipType.TONGUE,
        metricType: MetricType.DUAL,
        target: 5, // Pages
        targetSecondary: 15, // Minutes
        recurrence: Recurrence.DAILY,
        isCounterMode: false,
        privacyLevel: 'ratio'
    },
    {
        name: 'أذكار الصباح 🌤️',
        description: 'خصّص وقتاً في الصباح للذكر والتحصين',
        worshipType: WorshipType.TONGUE,
        metricType: MetricType.COUNT,
        target: 31, // Based on the number of subItems
        recurrence: Recurrence.DAILY,
        isCounterMode: true,
        privacyLevel: 'ratio',
        subItems: [
            { id: 'm1', text: 'أَعُوذُ بِاللهِ مِنْ الشَّيْطَانِ الرَّجِيمِ\nاللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ.', target: 1 },
            { id: 'm2', text: 'بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم\nقُلْ هُوَ ٱللَّهُ أَحَدٌ، ٱللَّهُ ٱلصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌ.', target: 3 },
            { id: 'm3', text: 'بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم\nقُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ، مِن شَرِّ مَا خَلَقَ، وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ، وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ، وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ.', target: 3 },
            { id: 'm4', text: 'بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ، مَلِكِ النَّاسِ، إِلَهِ النَّاسِ، مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ، الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ، مِنَ الْجِنَّةِ وَ النَّاسِ.', target: 3 },
            { id: 'm5', text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.', target: 1 },
            { id: 'm6', text: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.', target: 1 },
            { id: 'm7', text: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا.', target: 3 },
            { id: 'm8', text: 'اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ.', target: 4 },
            { id: 'm9', text: 'اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ.', target: 1 },
            { id: 'm10', text: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.', target: 7 },
            { id: 'm11', text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.', target: 3 },
            { id: 'm12', text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ.', target: 1 },
            { id: 'm13', text: 'أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ، وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ.', target: 1 },
            { id: 'm14', text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.', target: 3 },
            { id: 'm15', text: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ.', target: 3 },
            { id: 'm16', text: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ، وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ.', target: 3 },
            { id: 'm17', text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي.', target: 1 },
            { id: 'm18', text: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.', target: 3 },
            { id: 'm19', text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ، اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذَا الْيَوْمِ فَتْحَهُ، وَنَصْرَهُ، وَنُورَهُ، وَبَرَكَتَهُ، وَهُدَاهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِيهِ وَشَرِّ مَا بَعْدَهُ.', target: 1 },
            { id: 'm20', text: 'اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ، فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءًا أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ.', target: 1 },
            { id: 'm21', text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.', target: 3 },
            { id: 'm22', text: 'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى نَبِيِّنَا مُحَمَّدٍ.', target: 10 },
            { id: 'm23', text: 'اللَّهُمَّ إِنَّا نَعُوذُ بِكَ مِنْ أَنْ نُشْرِكَ بِكَ شَيْئًا نَعْلَمُهُ، وَنَسْتَغْفِرُكَ لِمَا لَا نَعْلَمُهُ.', target: 3 },
            { id: 'm24', text: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ، وَأَعُوذُ بِكَ مِنَ الْبُخْلِ وَالْجُبْنِ، وَأَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ.', target: 3 },
            { id: 'm25', text: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ.', target: 3 },
            { id: 'm26', text: 'يَا رَبِّ لَكَ الْحَمْدُ كَمَا يَنْبَغِي لِجَلَالِ وَجْهِكَ، وَلِعَظِيمِ سُلْطَانِكَ.', target: 3 },
            { id: 'm27', text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا.', target: 1 },
            { id: 'm28', text: 'اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلا أَنْتَ، عَلَيْكَ تَوَكَّلْتُ، وَأَنْتَ رَبُّ الْعَرْشِ الْعَظِيمِ، مَا شَاءَ اللَّهُ كَانَ، وَمَا لَمْ يَشَأْ لَمْ يَكُنْ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ، أَعْلَمُ أَنَّ اللَّهَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، وَأَنَّ اللَّهَ قَدْ أَحَاطَ بِكُلِّ شَيْءٍ عِلْمًا.', target: 1 },
            { id: 'm29', text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.', target: 100 },
            { id: 'm30', text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.', target: 100 },
            { id: 'm31', text: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ.', target: 100 }
        ]
    },
    {
        name: 'اغتنم رمضان 🌙',
        description: 'وِرد متكامل من الأذكار والسنن والطاعات في شهر الخيرات',
        worshipType: WorshipType.COMPREHENSIVE,
        metricType: MetricType.COUNT,
        target: 24, // Based on the number of subItems
        recurrence: Recurrence.DAILY,
        isCounterMode: true,
        privacyLevel: 'ratio',
        subItems: [
            { id: 'r1', text: 'اللهم اجعل عملي كله صالحاً، واجعله لوجهك خالصاً، ولا تجعل لأحد فيه شيئاً', target: 100 },
            { id: 'r2', text: 'رب اغفر لي وتب عليا إنك انت التواب الرحيم', target: 100 },
            { id: 'r3', text: 'رب اغفر لي وهب لي من واسع فضلك إنك انت الوهاب', target: 100 },
            { id: 'r4', text: 'رب اغفر لي ولوالدي ولجميع المسلمين', target: 100 },
            { id: 'r5', text: 'سبحان الله والحمد لله ولا إله إلا الله والله أكبر ولا حول ولا قوة الا بالله العلي العظيم (عدد ما خلق وملء ما خلق وعدد ما في السماوات والارض وملء ما في السماوات والارض وعدد ما أحصى كتابه وملء ما أحصى كتابه وعدد كل شيء وملء كل شيء)', target: 100 },
            { id: 'r6', text: 'لا إله الا انت سبحانك إني كنت من الظالمين', target: 100 },
            { id: 'r7', text: 'حسبنا الله ونعم الوكيل', target: 100 },
            { id: 'r8', text: 'اللهم إني اسألك من فضلك ورحمتك فإنه لا يملكها الا انت', target: 100 },
            { id: 'r9', text: 'سبوح قدوس رب الملائكة والروح', target: 100 },
            { id: 'r10', text: 'الصلاة على النبي', target: 100 },
            { id: 'r11', text: 'اللهم إنك عفو تحب العفو فاعفو عنا', target: 100 },
            { id: 'r12', text: 'سبحان الله وبحمده وسبحان الله العظيم (عدد خلقه ورضا نفسه وزنة عرشه ومداد كلماته)', target: 100 },
            { id: 'r13', text: 'قراءة جزء من القرآن الكريم', target: 1 },
            { id: 'r14', text: 'أذكار الصباح كاملة', target: 1 },
            { id: 'r15', text: 'أذكار المساء كاملة', target: 1 },
            { id: 'r16', text: 'أذكار النوم', target: 1 },
            { id: 'r17', text: 'أذكار بعد الصلوات المكتوبة', target: 5 },
            { id: 'r18', text: 'أذكار السحر (الاستغفار في الثلث الأخير)', target: 1 },
            { id: 'r19', text: 'صدقة ولو بالقليل', target: 1 },
            { id: 'r20', text: 'عمل أو قول طيب مع الآخرين', target: 1 },
            { id: 'r21', text: 'صلاة التراويح / القيام', target: 8 },
            { id: 'r22', text: 'صلاة الوتر', target: 1 },
            { id: 'r23', text: 'صلاة الضحى', target: 1 },
            { id: 'r24', text: 'السنن الرواتب قبل وبعد الصلوات', target: 5 }
        ]
    }
];
